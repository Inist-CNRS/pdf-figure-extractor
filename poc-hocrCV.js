const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const tesseract = require('./modules/coordTesseract')
const opencv = require('./modules/coordOpenCV')
const helpers = require('./modules/helpers')
const util = require('util');

/*
  Object
*/
let PocHocrCV = {}



PocHocrCV.init = (config) => {
  return new Promise(function(resolve, reject) {
    if (config.imageInputPath && config.imageOutputPath) {
      PocHocrCV.imageInputPath = config.imageInputPath
      PocHocrCV.imageOutputPath = config.imageOutputPath
    } else {
      reject("Un parametre de configuration est manquant")
    }
    if (!fs.existsSync(PocHocrCV.imageInputPath)) reject("L'image n'existe pas")
    else resolve()
  })
}

PocHocrCV.exec = () => {
  bluebird.join(tesseract.init(PocHocrCV.imageInputPath, [0,3]), opencv.init(PocHocrCV.imageInputPath), function(tesseract, openCV) {
    arrayOfOpenCV = openCV.filter().contours().get()
    arrayOfTesseract = tesseract.getArray()
    const common = PocHocrCV.compare(arrayOfTesseract, arrayOfOpenCV)
    helpers.writeOnImage(PocHocrCV.imageInputPath, 'tmp/output.png',common)
    helpers.cropImage(common, PocHocrCV.imageInputPath, 'tmp')
  })
}

PocHocrCV.compare = function(tessTab, opencvTab) {
  const margin = 10
  const newTab = new Set()
  for (var i = 0; i < tessTab.length; i++) {
    for (var j = 0; j < opencvTab.length; j++) {
      if (tessTab[i].x > opencvTab[j].x - 20 &&
          tessTab[i].x < opencvTab[j].x + 20 &&
          tessTab[i].y > opencvTab[j].y - 20 &&
          tessTab[i].y < opencvTab[j].y + 20 ){
        if (PocHocrCV.howManyRectangleInside(opencvTab, opencvTab[j])>1) {
          newTab.add(opencvTab[j])
        }
      }
    }
  }
  return Array.from(newTab)
}


PocHocrCV.howManyRectangleInside = function (opencvTab, item) {
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

module.exports = PocHocrCV
