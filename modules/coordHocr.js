let cheerio = require('cheerio')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))

let coordHocr = {}

/*
  Init module with config
  input: config {hocrPath}
*/
coordHocr.init = function(config) {
  return fs.readFileAsync(config.hocrPath, 'utf8').then(html => {
    return new Promise((resolve, reject) => {
      coordHocr.$ = cheerio.load(html, {
        xmlMode: true
      });
      resolve(coordHocr)
    });
  })
}

/*
  Get coord from hocr by segment
  input: void
  output: { area:[ {x:?,y:?,w:?,h:?},... ], par:..., line:..., word:... }
*/
coordHocr.getCoordFromHocr = function() {
  coordHocr.objectOfSegment = {}
  coordHocr.objectOfSegment['area'] = coordHocr.getElem('.ocr_carea')
  coordHocr.objectOfSegment['par'] = coordHocr.getElem('.ocr_par')
  coordHocr.objectOfSegment['line'] = coordHocr.getElem('.ocr_line')
  coordHocr.objectOfSegment['word'] = coordHocr.getElem('.ocrx_word')
  return coordHocr.objectOfSegment
}

/*

*/
coordHocr.getElem = function(elem) {
  const $ = coordHocr.$
  const arrayOfCoord = []
  for (let i = 0; i < $(elem).length; i++) {
    let item = $($(elem)[i])
    const arr = item.attr('title').split(';')
    const position = arr[0].split(' ')
    const x = position[1]
    const y = position[2]
    const h = Number(position[4]) - Number(position[2])
    const w = Number(position[3]) - Number(position[1])
    const style_height = 'h:' + h + "px; "
    const style_width = 'w:' + w + "px; "

    arrayOfCoord.push({
      x,
      y,
      w,
      h
    })
  }
  return arrayOfCoord
}



coordHocr.getSameCoord = function() {
  const arrayOfSame = []
  const coords = coordHocr.getCoordFromHocr()
  coords.area.forEach(coordArea => {
    coords.word.forEach(coordWord => {
      if (coordArea.x === coordWord.x &&
          coordArea.y === coordWord.y &&
          coordArea.w === coordWord.w &&
          coordArea.h === coordWord.h) {
        arrayOfSame.push({x: coordArea.x, y:coordArea.y, w:coordArea.w, h:coordArea.h})
      }
    })
  })
  return arrayOfSame
}


coordHocr.getArray = function() {
  let coords = coordHocr.getSameCoord()
  let arrayOfArray = []
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (coords[i].x == coords[j].x && i !== j || coords[i].w < 10) {
        arrayOfArray.push(coords[i])
      }
    }
  }
  return arrayOfArray
}

module.exports = coordHocr
