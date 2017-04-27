const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const coordHocr = require('./modules/coordHocr')
const helpers = require('./modules/helpers')


let PocHocrCV = {}


PocHocrCV.init = (config) => {
  return new Promise(function(resolve, reject) {
    // Construction de l'environnement
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
  coordHocr.init({
    hocrPath
  }).then(_ => {
    return coordHocr.getArray()
  }).then(coords => {
    console.log(coords);
    helpers.writeOnImage(PocHocrCV.imageInputPath, PocHocrCV.imageOutputPath, coords)
  })
}

module.exports = PocHocrCV
