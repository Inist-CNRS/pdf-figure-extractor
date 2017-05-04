let cheerio = require('cheerio')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const octachore = require('octachore')
const helpers = require('./helpers')

let coordHocr = {}

/*
  Init module with config
  input: config {hocrPath}
*/
coordHocr.init = function(image, elem) {
  coordHocr.objectOfSegment = {}
  coordHocr.imageInputPath = image
  let i = 0
  return new Promise(function(resolve, reject) {
    octachore.getAllComponentImage(image,0,(error, results) => {
      coordHocr.objectOfSegment.area = results
      i++
      if (i==2) {
        resolve(coordHocr)
      }
    })
    octachore.getAllComponentImage(image,3,(error, results) => {
      coordHocr.objectOfSegment.word = results
      i++
      if (i==2) {
        resolve(coordHocr)
      }
    })
  })
}



coordHocr.getSameCoord = function() {
  const arrayOfSame = new Set()
  const coords = coordHocr.objectOfSegment
  coords.word.forEach(coordArea => {
        arrayOfSame.add({x: coordArea.x, y:coordArea.y, w:coordArea.w, h:coordArea.h})
  })
  return Array.from(arrayOfSame)
}


coordHocr.getArray = function() {
  let coords = coordHocr.getSameCoord()
  let arrayOfArray = new Set()
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (coords[i].x == coords[j].x && i !== j || coords[i].w < 10) {
        arrayOfArray.add(coords[i])
      }
    }
  }
  return Array.from(arrayOfArray)
}

module.exports = coordHocr
