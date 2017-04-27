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
    else resolve('zlfk,zef')
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


const config = {
  imageInputPath: 'test/images/test1.png',
  imageOutputPath: 'test/output/test1.png',
  hocrPath: 'test/hocr/test1.hocr'
}


PocHocrCV.init(config).then((data) => {
  return helpers.createHocr(config.imageInputPath, config.hocrPath)
}).then(data=>{
  console.log(data);
}).catch(err=>console.log(err))
module.exports = PocHocrCV
