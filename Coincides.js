const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const mkdirp = bluebird.promisifyAll(require('mkdirp'))
const tesseract = require('./modules/coordTesseract')
const opencv = require('./modules/coordOpenCV')
const helpers = require('./modules/helpers')
const util = require('util')

/*
  Object
*/
let Coincides = {}

Coincides.init = (config) => {
  Coincides.z='lk'
  return new Promise(function(resolve, reject) {
    if(!config.imageInputPath || !config.directoryOutputPath){
      reject("Un parametre de configuration est manquant")
      return;
    }
    for (var prop in config) {
      Coincides[prop] = config[prop]
    }
    console.log('sjdflsdfhsdfjklh');
    Coincides.outputWithoutArray = `${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/output.png`
    Coincides.directoryPartialPath = `${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/partials`
    if (!fs.existsSync(Coincides.imageInputPath)){
      reject("L'image n'existe pas")
      return;
    }
    mkdirp.mkdirpAsync(`${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/partials`).then(_=>{
      resolve(Coincides)
    }).catch(err=>reject(err))
  })
}

Coincides.exec = () => {
  bluebird.join(tesseract.init(Coincides.imageInputPath, [0,3]), opencv.init(Coincides.imageInputPath), function(tesseract, openCV) {
    arrayOfOpenCV = []
    arrayOfTesseract = tesseract.getArray()
    const common = Coincides.compare(arrayOfTesseract, arrayOfOpenCV)
    helpers.writeOnImage(Coincides.imageInputPath, Coincides.outputWithoutArray, common)
    helpers.cropImage(common, Coincides.imageInputPath, Coincides.directoryPartialPath)
  })
}

Coincides.compare = function(tessTab, opencvTab) {
  const margin = 10
  const newTab = new Set()
  for (var i = 0; i < tessTab.length; i++) {
    for (var j = 0; j < opencvTab.length; j++) {
      if (tessTab[i].x > opencvTab[j].x - 20 &&
          tessTab[i].x < opencvTab[j].x + 20 &&
          tessTab[i].y > opencvTab[j].y - 20 &&
          tessTab[i].y < opencvTab[j].y + 20 ){
        if (Coincides.howManyRectangleInside(opencvTab, opencvTab[j])>1) {
          newTab.add(opencvTab[j])
        }
      }
    }
  }
  return Array.from(newTab)
}


Coincides.howManyRectangleInside = function (opencvTab, item) {
  let nbRect = 0;
  var index = opencvTab.indexOf(item);
  for (var i = 0; i < opencvTab.length; i++) {
    if (index !== i) {
      const openCVItem = opencvTab[i]
      if (openCVItem.x > item.x && openCVItem.x + openCVItem.w < (item.x + item.w) - 20) {
        nbRect++
      }
    }
  }
  return nbRect
}

module.exports = Object.assign({}, Coincides);
