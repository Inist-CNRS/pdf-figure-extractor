const fs = require('fs');
const coordHocr = require('./modules/coordHocr')
const helpers = require('./modules/helpers')


/*
  Permet de supprimer les tableaux et pictogramme

  input: image
  output: image sans tableaux et pictogramme
*/
class PocHocrCV {
  constructor(config) {
    // Construction de l'environnement
    this.imagePath = config.input
    this.output = config.output
    this.hocrPath = config.hocr
    // On test si l'on est pret a lancer l'ocerisation
    return this.test()
  }

  exec() {
    const hocrPath = this.hocrPath
    const coordHocrModule = new coordHocr({
      hocrPath
    }).then(self => {
      return self.getArray()
    }).then(coords => {
      helpers.writeOnImage(this.imagePath, this.output, coords)
    })
  }

  test() {
    if (!this.imagePath ||
      !this.output ||
      !this.hocrPath) {
      throw new Error("Un parametre de configuration est manquant")
    }
    if (!fs.existsSync(this.imagePath)) {
      throw new Error("Le fichier n'existe pas")
    }
    if (!fs.existsSync(this.hocrPath)) {
      return helpers.createHocr(this.imagePath, this.hocrPath)
    }
  }
}
module.exports = PocHocrCV
