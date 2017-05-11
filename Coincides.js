const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const mkdirp = bluebird.promisifyAll(require('mkdirp'))
const tesseract = require('./modules/coordTesseract')
const opencv = require('./modules/coordOpenCV')
const helpers = require('./modules/helpers')
const util = require('util')

class Coincides {
  constructor() {

  }

  init(config) {
    return new Promise((resolve, reject) => {
      if (!config.imageInputPath || !config.directoryOutputPath) {
        reject("Un parametre de configuration est manquant")
        return;
      }
      for (var prop in config) {
        this[prop] = config[prop]
      }
      this.outputWithoutArray = `${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/output.png`
      this.directoryPartialPath = `${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/partials`
      if (!fs.existsSync(this.imageInputPath)) {
        reject("L'image n'existe pas")
        return;
      }
      mkdirp.sync(`${config.directoryOutputPath}/${helpers.getFilename(config.imageInputPath)}/partials`)
      resolve(this)
    })
  }

  exec() {
    return bluebird.join(tesseract.init(this.imageInputPath, [0, 3]), new opencv().init(this.imageInputPath), (tesseract, openCV) => {
      const arrayOfOpenCV = openCV.filter().contours().get()
      const arrayOfTesseract = tesseract.getArray()
      const common = this.compare(arrayOfTesseract, arrayOfOpenCV)
      // console.log(this.checkHigherRectangle(common));
      return bluebird.join(helpers.writeOnImage(this.imageInputPath, this.outputWithoutArray, common), helpers.cropImage(common, this.imageInputPath, this.directoryPartialPath))
    })
  }

  compare(tessTab, opencvTab) {
    const margin = 10
    const newTab = new Set()
    for (var i = 0; i < tessTab.length; i++) {
      for (var j = 0; j < opencvTab.length; j++) {
        if (tessTab[i].x > opencvTab[j].x - 20 &&
          tessTab[i].x < opencvTab[j].x + 20 &&
          tessTab[i].y > opencvTab[j].y - 20 &&
          tessTab[i].y < opencvTab[j].y + 20) {
          if (this.howManyRectangleInside(opencvTab, opencvTab[j]).length > 1) {
            newTab.add(opencvTab[j])
          }
        }
      }
    }
    let rect = this.checkHigherRectangle(Array.from(newTab))
    return rect
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

        if (
          tabj.x<tabi.x && tabj.x+tabj.w > tabi.x + tabi.w &&
          tabj.y<tabi.y && tabj.y+tabj.h > tabi.y + tabi.h
        ) {
          // On supprime tout les rectangles interieurs
          newTab.delete(tabi)
        }
      }
    }
    return Array.from(newTab)
  }


}

module.exports = Coincides
