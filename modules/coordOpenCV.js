const helpers = require('./helpers')
var Jimp = require("jimp");
const util = require('util');


var lowThresh = 100;
var highThresh = 100;
var nIters = 1;
var minArea = 500;
var BLUE = [0, 255, 0]; // B, G, R
var RED = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R


class coordOpenCV {
  constructor() {

  }
  init(imageInputPath) {
    this.imageInputPath = imageInputPath
    this.imageInputFilename = helpers.getFilename(imageInputPath)

    return this.readImage(imageInputPath)

  }

  readImage(inputImagePath) {
    return new Promise((resolve, reject) => {
      let cv = new require("opencv")
      cv.readImage(inputImagePath, (err, im) => {
        if (err) reject(err)
        this.im = im
        if (im.width() < 1 || im.height() < 1) reject('Image has no size')
        this.matrix = new cv.Matrix(im.height(), im.width());
        resolve(this)
      })
    })
  }


  filter() {
    const im = this.im
    im.canny(lowThresh, highThresh);
    im.dilate(nIters);
    return this
  }

  contours() {
    const im = this.im
    this.arrayOfContour = []
    let contours = im.findContours();
    for (let i = 0; i < contours.size(); i++) {
      if (contours.area(i) < minArea) continue;
      var arcLength = contours.arcLength(i, true);
      contours.approxPolyDP(i, 0.01 * arcLength, true);

      switch (contours.cornerCount(i)) {
        case 4:
          const rect = contours.boundingRect(i)
          if (
            rect.width < (this.im.width() - 70)
          ) {
            const x = rect.x;
            const y = rect.y;
            const w = rect.width;
            const h = rect.height;
            this.arrayOfContour.push({
              x,
              y,
              w,
              h
            })
          }
      }
    }
    return this
  }


  write(output) {
    helpers.writeOnImage(this.imageInputPath, output, this.arrayOfContour)
    return this
  }
  get() {
    return this.arrayOfContour
  }

}

module.exports = coordOpenCV
