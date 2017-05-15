const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const mkdirp = bluebird.promisifyAll(require('mkdirp'))
const tesseract = require('./modules/coordTesseract')
const opencv = require('./modules/coordOpenCV')
const helpers = require('./modules/helpers')
const util = require('util')
const path = require('path');
const Ghostscript = require('ghostscript-js')
const gm = require('gm').subClass({
  imageMagick: true
});

class Coincides {
  constructor() {

  }

  init(config) {
    return new Promise((resolve, reject) => {
      if (!config.pdfInputPath || !config.directoryOutputPath) {
        reject("Un parametre de configuration est manquant")
        return;
      }
      for (var prop in config) {
        this[prop] = config[prop]
      }
      this.outputWithoutArray = `${config.directoryOutputPath}/${helpers.getFilename(config.pdfInputPath)}/output.png`
      this.directoryPartialPath = `${config.directoryOutputPath}/${helpers.getFilename(config.pdfInputPath)}/partials`
      this.directoryTmpPath = path.resolve(__dirname, 'tmp', helpers.getFilename(this.pdfInputPath))
      if (!fs.existsSync(this.pdfInputPath)) {
        reject("Le pdf n'existe pas:", config)
        return;
      }

      mkdirp.sync(this.directoryTmpPath)
      mkdirp.sync(`${config.directoryOutputPath}/${helpers.getFilename(config.pdfInputPath)}/partials`)
      resolve(this)
    })
  }

  exec() {
    console.log("-============",this.pdfInputPath,"===============");
    return this.pdfToImg()
      .then(_ => {
        return this.preprocessing()
      })
      .then(_ => {
        return this.detect()
      })
  }

  detect() {
    console.log('|>Detect');
    return fs.readdirAsync(this.directoryTmpPath).map((file) => {
      file = path.resolve(this.directoryTmpPath, file)
      if (path.extname(file) === '.png') {
        return bluebird.join(tesseract.init(file, [0, 3]), new opencv().init(file), (tesseract, openCV) => {
          const arrayOfOpenCV = openCV.filter().contours().get()
          const arrayOfTesseract = tesseract.getArray()
          const common = this.compare(arrayOfTesseract, arrayOfOpenCV)
          if (common.length > 0) {
            console.log(common.length, ' tableau trouvé dans ' + this.pdfInputPath);
            // console.log(this.checkHigherRectangle(common));
            return bluebird.join(helpers.writeOnImage(file, this.outputWithoutArray, common), helpers.cropImage(common, file, this.directoryPartialPath))
          } else return
        })
      }
      return ;
    }, {
      concurrency: 4
    })
  }

  compare(tessTab, opencvTab) {
    const margin = 10
    const newTab = new Set()
    for (var i = 0; i < tessTab.length; i++) {
      for (var j = 0; j < opencvTab.length; j++) {
        if (
          tessTab[i].x > opencvTab[j].x - 80 &&
          tessTab[i].x < opencvTab[j].x + 80 &&
          tessTab[i].y > opencvTab[j].y - 80 &&
          tessTab[i].y < opencvTab[j].y + 80
        ) {
          newTab.add(opencvTab[j])
        }
      }
    }
    return this.checkHigherRectangle(Array.from(newTab))
  }

  howManyRectangleInside(opencvTab, item) {
    let rectangles = new Set();
    var index = opencvTab.indexOf(item);
    for (var i = 0; i < opencvTab.length; i++) {
      if (index !== i) {
        const openCVItem = opencvTab[i]
        if (openCVItem.x > item.x && openCVItem.x + openCVItem.w < (item.x + item.w) - 20) {
          rectangles.add(opencvTab[i])
        }
      }
    }
    return Array.from(rectangles)
  }

  checkHigherRectangle(tab) {
    let newTab = new Set(tab)
    for (var i = 0; i < tab.length; i++) {
      let tabi = tab[i]
      for (var j = 0; j < tab.length; j++) {
        let tabj = tab[j]
        // Je veux savoir si tabi contient des rectangles
        // Pour qu'un rectangle soit contenu il faut que:
        // - son tabj.x soit plus grand que tabi.x mais que tabj.x+tabj.w soit plus petit que tabi.x+tabi.w
        // - son tabj.y soit plus grand que tabi.y mais que tabj.y+tabj.h soit plus petit que tabi.y+tabi.h
        if (!tabi.a) tabi.a = []
        if (
          tabi.x <= tabj.x && i !== j && tabi.y <= tabj.y && tabi.x + tabi.w >= tabj.x + tabj.w && tabi.y + tabi.h >= tabj.y + tabj.h
        ) {

          tabi.a.push(tabj)
          // On supprime tout les rectangles interieurs
          newTab.delete(tabj)
        }
      }
    }

    let tmpArray = Array.from(newTab)
    for (var i = 0; i < tmpArray.length; i++) {
      let tabi = tmpArray[i]

      let nbSameRect = 0
      for (var j = 0; j < tabi.a.length; j++) {
        let tabj = tabi.a[j]
        if (tabj.w > tabi.w - 30 && tabj.y > tabi.y - 30) {
          nbSameRect++
        }

      }
      if (nbSameRect == tabi.a.length)
        newTab.delete(tabi)

    }
    return Array.from(newTab)
  }

  pdfToImg() {
    return new Promise((resolve, reject) => {
      console.log("|>convert pdf to img");
      console.log("|    >", this.pdfInputPath);
      this.imageTmpPath = path.resolve(this.directoryTmpPath + '/%03d.png')
      const fileToRead = this.pdfInputPath
      Ghostscript.exec([
      '-q',
      '-dNOPAUSE',
      '-dBATCH',
      '-sDEVICE=png16m',
      '-r300',
      '-sOutputFile=' + this.imageTmpPath,
      fileToRead
      ], (codeError) => {
        if (codeError) {
          console.log(fileToRead);
          console.log(this.imageTmpPath);
          reject(codeError)
          return;
        }
        resolve(this)
      })

    })
  }

  preprocessing() {
    console.log("|>preprocessing");
    const fileToWrite = this.imageTmpPath
    return fs.readdirAsync(this.directoryTmpPath).map((file) => {
      file = path.resolve(this.directoryTmpPath, file)
      console.log("|    >", file);
      return new Promise(function(resolve, reject) {
        gm(file).contrast(-7).gamma(0.2, 0.2, 0.2).colorspace('GRAY').write(file, err => {
          if (err) reject(err)
          resolve()
        })
      })
    }, {
      concurrency: 2
    })
  }

}

module.exports = Coincides
