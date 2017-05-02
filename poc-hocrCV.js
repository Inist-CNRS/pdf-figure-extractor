const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const coordHocr = require('./modules/coordHocr')
const coordOpenCV = require('./modules/coordOpenCV')
const helpers = require('./modules/helpers')
const util = require('util');

/*
  Object
*/
let PocHocrCV = {}



PocHocrCV.init = (config) => {
  return new Promise(function(resolve, reject) {
    if (config.imageInputPath && config.imageOutputPath && config.hocrPath) {
      PocHocrCV.imageInputPath = config.imageInputPath
      PocHocrCV.imageOutputPath = config.imageOutputPath
      PocHocrCV.hocrPath = config.hocrPath
    } else {
      reject("Un parametre de configuration est manquant")
    }
    if (!fs.existsSync(PocHocrCV.imageInputPath)) reject("L'image n'existe pas")
    helpers.createHocr(config.imageInputPath, config.hocrPath).then(_ => {
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

PocHocrCV.exec = () => {
  const hocrPath = PocHocrCV.hocrPath
  bluebird.join(coordHocr.init({hocrPath}), coordOpenCV.init(PocHocrCV.imageInputPath), function(tesseract, openCV) {
    arrayOfOpenCV = openCV.filter().contours().write('./tmp/output.png').get()
    arrayOfTesseract = tesseract.getArray()
    const common = PocHocrCV.compare(arrayOfTesseract, arrayOfOpenCV)
    helpers.cropImage(common, PocHocrCV.imageInputPath, 'tmp')
  })
}

PocHocrCV.compare = function(tab1, tab2) {
  const margin = 10
  const newTab = new Set()
  for (var i = 0; i < tab1.length; i++) {
    for (var j = 0; j < tab2.length; j++) {
      if (tab1[i].x > tab2[j].x - 20 &&
          tab1[i].x < tab2[j].x + 20 &&
          tab1[i].y > tab2[j].y - 20 &&
          tab1[i].y < tab2[j].y + 20 ){
        newTab.add(tab2[j])
      }
    }
  }
  return Array.from(newTab)
}

module.exports = PocHocrCV
