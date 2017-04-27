const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const coordHocr = require('./modules/coordHocr')
const helpers = require('./modules/helpers')


let PocHocrCV = {}


PocHocrCV.init = (config) => {
  return new Promise(function(resolve, reject) {
    // Construction de l'environnement
    if (config.imageInputPath && config.imageOutputPath && config.hocrPath) {
      this.imageInputPath = config.imageInputPath
      this.imageOutputPath = config.imageOutputPath
      this.hocrPath = config.hocrPath
    } else {
      reject("Un parametre de configuration est manquant")
    }
    if(!fs.existsSync(this.imageInputPath)) reject("L'image n'existe pas")
    helpers.createHocr(config.imageInputPath, config.hocrPath).then(_=>{
      resolve()
    }).catch(err=>{
      reject(err)
    })
  })
}


PocHocrCV.exec = () => {
  const hocrPath = this.hocrPath
  const coordHocrModule = new coordHocr({
    hocrPath
  }).then(self => {
    return self.getArray()
  }).then(coords => {
    helpers.writeOnImage(this.imageInputPath, this.imageOutputPath, coords)
  })
}

module.exports = PocHocrCV
