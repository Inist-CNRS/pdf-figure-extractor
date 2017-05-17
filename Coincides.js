const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisifyAll(require('mkdirp'))
const tesseract = require('./lib/coordTesseract')
const opencv = require('./lib/coordOpenCV')
const helpers = require('./lib/helpers')
const util = require('util')
const path = require('path');
const Ghostscript = require('ghostscript-js')
const gm = require('gm').subClass({
  imageMagick: true
});






class Coincides {

  constructor(config) {
    return new Promise((resolve, reject) => {
      if (!config.pdfInputPath || !config.directoryOutputPath) {
        reject("Un parametre de configuration est manquant")
        return;
      }
      for (var prop in config) {
        this[prop] = config[prop]
      }
      this.directoryTmpPath = path.resolve(__dirname, 'tmp', helpers.getFilename(this.pdfInputPath))
      if (!fs.existsSync(this.pdfInputPath)) {
        reject("Le pdf n'existe pas:", config)
        return;
      }
      mkdirp.sync(this.directoryTmpPath)
      resolve(this)
    })
  }

  exec() {
    console.log('====================================================================================');
    console.time('execution');
    // return this.pdfToImg()
    //   .then(_ => {
    //     console.log("|>preprocessing");
    //     return fs.readdirAsync(this.directoryTmpPath)
    //       .map((file) => {
    //         return this.preprocessing(path.resolve(this.directoryTmpPath, file)).catch(err => console.log(err))
    //       }, {
    //         concurrency: 2
    //       })
    //   })
    //   .then(_ => {
        return this.detect().catch(err => console.log(err))
      // }).then(_=>{
      //   console.timeEnd('execution');
      //   console.log('====================================================================================');
      //   console.log();
      // })
  }

  detect() {
    console.log('|>Detection');
    return fs.readdirAsync(this.directoryTmpPath).mapSeries((file) => {
      console.log('|  >',file);
      file = path.resolve(this.directoryTmpPath, file)
      if (path.extname(file) === '.png') {
        return Promise.join(tesseract.init(file, [0, 3]), new opencv().init(file), (tesseract, openCV) => {
          const arrayOfOpenCV = openCV.filter().contours().get()
          const arrayOfTesseract = tesseract.getArray()
          const common = compare(arrayOfTesseract, arrayOfOpenCV)
          const arrayofArray = checkHigherRectangle(common)
          const directoryPartialPath = `${this.directoryOutputPath}/${helpers.getFilename(this.pdfInputPath)}/${helpers.getFilename(file)}/partials`
          const outputWithoutArray = `${this.directoryOutputPath}/${helpers.getFilename(this.pdfInputPath)}/${helpers.getFilename(file)}/output.png`
          mkdirp.sync(directoryPartialPath)
          if (arrayofArray.length > 1) {
            console.log('|    >', arrayofArray.length, ' tableau trouvé');
            const directoryPartialPath = `${this.directoryOutputPath}/${helpers.getFilename(this.pdfInputPath)}/${helpers.getFilename(file)}/partials`
            return Promise.join(helpers.writeOnImage(file, outputWithoutArray, arrayofArray), helpers.cropImage(arrayofArray, file, directoryPartialPath))
          } else {
            return fs.rename(file, outputWithoutArray,_=>{
              return
            })
          }
        }).catch(err => console.log(err))
      }
      return;
    }, {
      concurrency: 1
    })
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

  preprocessing(file) {
    return new Promise(function(resolve, reject) {
      console.log('|  >', file);
      gm(file).contrast(-7).gamma(0.2, 0.2, 0.2).colorspace('GRAY').write(file, err => {
        if (err) reject(err)
        resolve()
      })
    })
  }
}
module.exports = Coincides


function compare(tessTab, opencvTab) {
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
  return Array.from(newTab)
}

function checkHigherRectangle(tab) {
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
