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
  bluebird.join(coordHocr.init({hocrPath}), coordOpenCV.init('test/images/test2.png'), function(tesseract, openCV) {
    arrayOfOpenCV = openCV.filter().contours().write().get()
    arrayOfTesseract = tesseract.getArray()
    console.log(arrayOfOpenCV);
  })
}
module.exports = PocHocrCV
