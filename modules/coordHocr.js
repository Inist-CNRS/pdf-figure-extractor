let cheerio = require('cheerio')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
class coordHocr {
  constructor(config) {
    return fs.readFileAsync(config.hocrPath, 'utf8').then(html => {
      return new Promise((resolve, reject) => {
        this.$ = cheerio.load(html, {
          xmlMode: true
        });
        resolve(this)
      });
    })
    this.config = config
  }


  getCoord() {
    this.objectOfSegment = {}
    this.objectOfSegment['area'] = this.getElem('.ocr_carea')
    this.objectOfSegment['par'] = this.getElem('.ocr_par')
    this.objectOfSegment['line'] = this.getElem('.ocr_line')
    this.objectOfSegment['word'] = this.getElem('.ocrx_word')
    return this.objectOfSegment
  }

  getElem(elem) {
    const $ = this.$
    const arrayOfCoord = []
    for (let i = 0; i < $(elem).length; i++) {
      let item = $($(elem)[i])
      const arr = item.attr('title').split(';')
      const position = arr[0].split(' ')
      const left_pos = position[1]
      const top_pos = position[2]
      const height = Number(position[4]) - Number(position[2])
      const style_height = 'height:' + height + "px; "
      const width = Number(position[3]) - Number(position[1])
      const style_width = 'width:' + width + "px; "

      arrayOfCoord.push({
        left_pos,
        top_pos,
        width,
        height
      })
    }
    return arrayOfCoord
  }

  /*
  Permet de recuperer les segments qui sont considerés comme meme espace
  */
  getSameCoord () {
    const arrayOfSame = []
    const coords = this.getCoord()
    coords.area.forEach(coordArea => {
      const areaLeft = coordArea.left_pos
      const areaTop = coordArea.top_pos
      const areaWidth = coordArea.width
      const areaHeight = coordArea.height
      coords.word.forEach(coordWord => {
        if (areaLeft === coordWord.left_pos &&
          areaTop === coordWord.top_pos &&
          areaWidth === coordWord.width &&
          areaHeight === coordWord.height) {
          arrayOfSame.push({
            areaLeft,
            areaTop,
            areaWidth,
            areaHeight
          })
        }
      })
    })
    return arrayOfSame
  }


  getArray() {
    let coords = this.getSameCoord()
    let arrayOfArray = []
    for (let i = 0; i < coords.length; i++) {
      for (let j = 0; j < coords.length; j++) {
        if (coords[i].areaLeft == coords[j].areaLeft && i !== j || coords[i].areaWidth < 10) {
          arrayOfArray.push(coords[i])
        }
      }
    }
    return arrayOfArray
  }

}


module.exports = coordHocr
