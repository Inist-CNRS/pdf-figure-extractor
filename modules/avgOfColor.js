
    "use strict";
const util = require('util')
var _ = require('lodash')
var utilEach = require('util-each')

class MainColor {
  constructor(arrayOfPixels, option) {
    this.originArray = arrayOfPixels;
    let map = []
    let nbOccurencesTotal = arrayOfPixels.length

    arrayOfPixels = _.groupBy(arrayOfPixels, function(pixel) {return [pixel.r, pixel.g, pixel.b].join('-')})
    // console.log(nbOccurencesTotal);
    utilEach(arrayOfPixels, (inputValue, inputKey) => {
      nbOccurencesTotal += inputValue.length
      map.push({
        occurrence: inputValue.length,
        percent: (inputValue.length * 100) / nbOccurencesTotal,
        r: inputKey.split('-')[0],
        g: inputKey.split('-')[1],
        b: inputKey.split('-')[2]
      })
    })

    this.arrayOfPixels = map.sort((curr,next)=>next.occurrence - curr.occurrence)
  }

  main() {
    return this.arrayOfPixels[0];
  }

  all() {
    return this.arrayOfPixels
  }

  tail (percent) {
    let arrayTail = this.arrayOfPixels.filter((pixel) => pixel.percent < percent);
    return arrayTail
  }

  head (percent) {
    let arrayHead = this.arrayOfPixels.filter((pixel) => pixel.percent > percent);
    return arrayHead
  }

  getDistanceColor (color1, color2) {
    return Math.sqrt(Math.abs((color2.r - color1.r)^2+(color2.g - color1.g)^2+(color2.b - color1.b)^2))
  }
}


module.exports = MainColor
