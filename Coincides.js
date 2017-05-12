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

      if (common.length>0) {
        console.log(common.length, ' tableau trouvé dans ' + this.imageInputPath);
        // console.log(this.checkHigherRectangle(common));
        return bluebird.join(helpers.writeOnImage(this.imageInputPath, this.outputWithoutArray, common), helpers.cropImage(common, this.imageInputPath, this.directoryPartialPath))
      }
      else return

    })
  }

  compare(tessTab, opencvTab) {
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
    return this.checkHigherRectangle(Array.from(newTab))
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


    // let newTab = new Set(tab)
    // for (var i = 0; i < tab.length; i++) {
    //   let tabi = tab[i]
    //   for (var j = 0; j < tab.length; j++) {
    //     let tabj = tab[j]
    //     // Je veux savoir si tabi contient des rectangles
    //     // si il n'en contient pas, alors il est supprimé
    //     // Pour qu'un rectangle soit contenu il faut que:
    //     // - son tabj.x soit plus grand que tabi.x mais que tabj.x+tabj.w soit plus petit que tabi.x+tabi.w
    //     // - son tabj.y soit plus grand que tabi.y mais que tabj.y+tabj.h soit plus petit que tabi.y+tabi.h
    //     if (
    //       tabi.x <= tabj.x && i !== j && tabi.y <= tabj.y && tabi.x + tabi.w >= tabj.x + tabj.w && tabi.y + tabi.h >= tabj.y + tabj.h
    //     ) {
    //       // On supprime tout les rectangles interieurs
    //       if (!tabi.a) tabi.a = []
    //       tabi.a.push(tabj)
    //       newTab.delete(tabj)
    // //
    //     }
    //   }
    // }
    //

    // return newTab





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
      if(nbSameRect == tabi.a.length)
        newTab.delete(tabi)

    }
    return Array.from(newTab)
  }


}

module.exports = Coincides
