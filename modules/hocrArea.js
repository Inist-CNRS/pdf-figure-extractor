var fs = require('fs');
let cheerio = require('cheerio')

class HocrArea {
  constructor(hocr) {
    this.$hocr = cheerio.load(fs.readFileSync(hocr));
  }

  area () {
    let area = this.$hocr('.ocr_line')
    let arrayOfArea = []

    for (let i = 0; i < area.length; i++) {
      var arr = area[i].attribs.title.split(';')
      var position = arr[0].split(' ')
      var height = Number(position[4]) - Number(position[2])
      var width  = Number(position[3]) - Number(position[1])
      var x1 = position[1]
      var y1 = position[2]
      var x2 = Number(position[1]) + Number(width)
      var y2 = Number(position[2]) + Number(height)
      arrayOfArea.push({x1, y1, width, height, x2, y2})
    }
    return arrayOfArea
  }

}

module.exports = HocrArea
