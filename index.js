const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisifyAll(require('mkdirp'))
const tesseract = require('./lib/coordTesseract')
const opencv = require('./lib/coordOpenCV')
const helpers = require('./lib/helpers')
const util = require('util')
const path = require('path');
const Ghostscript = require('ghostscript-js')
const log = require('loglevel');
const rimraf = require('rimraf');
const Jimp = require('jimp')
const gm = require('gm').subClass({
  imageMagick: true
});
const utilEach = require('util-each')
const exec = require('child_process').exec;

class Pfe {

  constructor(config) {
    return new Promise((resolve, reject) => {
      config.debug ?
        (log.enableAll(), this.debug = true) :
        (log.disableAll(), this.debug = false)
      config.pdfInputPath ?
        (this.pdfInputPath = config.pdfInputPath) :
        (reject("There is no pdf in parameter: put the variable pdfInputPath into config"))
      config.directoryOutputPath ?
        (this.directoryOutputPath = config.directoryOutputPath) :
        (this.directoryOutputPath = path.resolve(__dirname, 'output'))
      config.directoryPartialPath ?
        (this.directoryPartialPath = config.directoryPartialPath) :
        (this.directoryPartialPath = path.resolve(__dirname, 'output'))
      config.tmp ?
        (this.directoryTmpPath = path.resolve(config.tmp, helpers.getFilename(this.pdfInputPath))) :
        (this.directoryTmpPath = path.resolve(__dirname, 'tmp', helpers.getFilename(this.pdfInputPath)))

      if (!fs.existsSync(this.pdfInputPath)) {
        reject("Le pdf n'existe pas:", config)
        return;
      }
      mkdirp.sync(this.directoryTmpPath)
      this.arrayOfPartials = []
      resolve(this)
    })
  }

  exec() {
    log.info('====================================================================================');
    if (this.debug) console.time('execution');
    return this.pdfToImg()
      .then(_ => {
        log.info("|>preprocessing");
        mkdirp.sync(path.resolve(this.directoryTmpPath, 'array'))
        mkdirp.sync(path.resolve(this.directoryTmpPath, 'pictures'))
        return fs.readdirAsync(this.directoryTmpPath)
          .map((
            file) => {
            if (path.extname(file) === '.png') {
              return Promise.join(
                this.preprocessing(path.resolve(this.directoryTmpPath, file), path.resolve(this.directoryTmpPath, 'array', file), -8, 0.2)
              )
            }
          }, {
            concurrency: 2
          })
      })
      .then(_ => {
        return this.detect().catch(err => console.log(err))
      })
      .then(_ => {
        if (this.debug) console.timeEnd('execution');
        log.info('====================================================================================');
        log.info();
        rimraf(this.directoryTmpPath, _ => {});
        return this.arrayOfPartials
      })
  }

  detect() {
    log.info('|>Detection');
    return fs.readdirAsync(this.directoryTmpPath).mapSeries((file) => {
      log.info('|  >', file);
      file = path.resolve(this.directoryTmpPath, file)
      if (path.extname(file) === '.png') {
        return Promise.join(tesseract.init(file, [0, 3]), new opencv().init(file), (tesseract, openCV) => {
          const arrayOfOpenCV = openCV.filter().contours().get()
          const arrayOfTesseract = tesseract.getArray()

          const common = compare(arrayOfTesseract, arrayOfOpenCV, file)


          const directoryPartialPath = path.resolve(this.directoryPartialPath, helpers.getFilename(this.pdfInputPath) + "&&&" + helpers.getFilename(file) + '-partials')
          const outputWithoutArray = path.resolve(__dirname, this.directoryOutputPath, helpers.getFilename(this.pdfInputPath) + "&&&" + helpers.getFilename(file) + '.png')

          console.log("|    >detection d'image")
          return isAnImageInTherectangle(common, file)
            .then(data => {
              return Promise.join(helpers.writeOnImage(file, outputWithoutArray, data), helpers.cropImage(data, file, directoryPartialPath))
                .then(partials => {
                  log.info('|      >', data.length, ' image trouvée');
                  this.arrayOfPartials = partials[1]
                  return
                })
              return helpers.cropImage(data, file, directoryPartialPath)
            })
            .then(_ => {
              console.log('|    >detection de tableaux')
              const arrayofArray = checkHigherRectangle(common)
              if (arrayofArray.length > 0) {
                log.info('|      >', arrayofArray.length, ' tableau trouvé');
                return Promise.join(helpers.writeOnImage(file, outputWithoutArray, arrayofArray), helpers.cropImage(arrayofArray, file, directoryPartialPath))
                  .then(partials => {
                    this.arrayOfPartials = partials[1]
                    return
                  })
              } else {
                return fs.rename(file, outputWithoutArray, _ => {
                  return
                })
              }
            })

        }).catch(err => console.log(err))
      }
      return;
    }, {
      concurrency: 1
    })
  }

  pdfToImg() {
    return new Promise((resolve, reject) => {
      log.info("|>convert pdf to img");
      log.info("|    >", this.pdfInputPath);
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

  preprocessing(input, output, contrast, gamma) {
    return new Promise(function(resolve, reject) {
      log.info('|  >', input);
      contrast = -7
      gamma = 0.2
      gm(input).contrast(contrast).gamma(gamma, gamma, gamma).colorspace('GRAY').write(output, err => {
        if (err) reject(err)
        resolve()
      })
    })
  }
}
module.exports = Pfe


function compare(tessTab, opencvTab, file) {
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

  // La premiere passe permet de réorganiser les rectangles en hierarchie
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

  // La deuxieme passe va permettre de supprimer des rectangles qui sont potentiellements détécté deux fois par opencv
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
    // On supprime les rectangles qui ne contiennent pas au moins de trois rectangles internes (cellules)
    if (tabi.a.length < 3)
      newTab.delete(tabi)
  }

  return Array.from(newTab)
}


function isAnImageInTherectangle(array, file) {
  const arrayofImg = []
  let tmpfile = path.join(path.dirname(file), 'tmp.png')
  return Promise.mapSeries(array, rectangle => {
    return new Promise(function(resolve, reject) {
      exec(`convert  ${file} -crop ${rectangle.w}x${rectangle.w}+${rectangle.x}+${rectangle.y} ${tmpfile} && convert ${tmpfile} -define histogram:unique-colors=true -format %c -depth 4 histogram:info:- | sort -n | wc -l`, (error, nbColor, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error)
          return;
        }
        if (nbColor > 200) {
          arrayofImg.push(rectangle)
        }
        resolve()
      });
    });
  }).then(data => {
    return arrayofImg
  })

}
