const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const octachore = require('octachore')
const helpers = require('./helpers')

let coordTesseract = {}

/*
  Init module with config
  input: config {hocrPath}
*/
coordTesseract.init = function(image, elem) {
  coordTesseract.objectOfSegment = {}
  coordTesseract.imageInputPath = image
  let i = 0
  return new Promise(function(resolve, reject) {
    octachore.getAllComponentImage(image, 0, (error, results) => {
      coordTesseract.objectOfSegment.area = results
      i++
      if (i == 2) {
        resolve(coordTesseract)
      }
    })
    octachore.getAllComponentImage(image, 3, (error, results) => {
      coordTesseract.objectOfSegment.word = results
      i++
      if (i == 2) {
        resolve(coordTesseract)
      }
    })
  })
}



coordTesseract.getSameCoord = function() {
  const arrayOfSame = new Set()
  const coords = coordTesseract.objectOfSegment
  if (coords.word === undefined) return []

  coords.word.forEach(coordArea => {
    arrayOfSame.add({
      x: coordArea.x,
      y: coordArea.y,
      w: coordArea.w,
      h: coordArea.h
    })
  })
  return Array.from(arrayOfSame)
}


coordTesseract.getArray = function() {
  let coords = coordTesseract.getSameCoord()
  let arrayOfArray = new Set()
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (coords[i].x == coords[j].x || coords[i].w < 10) {
        arrayOfArray.add(coords[i])
      }
    }
  }
  return Array.from(arrayOfArray)
}

module.exports = coordTesseract
