const helpers = require('./helpers')
let cv = require("opencv")
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


const coordOpenCV = {}


/*
  init opencv
  input: imageInputPath -> path to original image
*/
coordOpenCV.init = function(imageInputPath) {
  coordOpenCV.imageInputPath = imageInputPath
  coordOpenCV.imageInputFilename = helpers.getFilename(imageInputPath)

  return coordOpenCV.readImage(imageInputPath)

}

coordOpenCV.filter = function() {
  im = coordOpenCV.im
  im.convertGrayscale()
  im.canny(lowThresh, highThresh);
  im.dilate(nIters);
  return coordOpenCV
}

coordOpenCV.contours = function() {
  im = coordOpenCV.im
  coordOpenCV.arrayOfContour = []
  let contours = im.findContours();
  for (let i = 0; i < contours.size(); i++) {
    if (contours.area(i) < minArea) continue;
    var arcLength = contours.arcLength(i, true);
    contours.approxPolyDP(i, 0.01 * arcLength, true);

    switch (contours.cornerCount(i)) {
      case 4:
        const rect = contours.boundingRect(i)
        if (rect.width > 40 &&
            rect.width < (coordOpenCV.im.width() - 70) &&
            rect.height > 100
          ) {
          const x = rect.x;
          const y = rect.y;
          const w = rect.width;
          const h = rect.height;
          coordOpenCV.arrayOfContour.push({
            x,
            y,
            w,
            h
          })
        }
      }
  }
  return coordOpenCV
}


coordOpenCV.write = function(output) {
  helpers.writeOnImage(coordOpenCV.imageInputPath, output, coordOpenCV.arrayOfContour)
  return coordOpenCV
}


coordOpenCV.get = function() {
  return coordOpenCV.arrayOfContour
}

coordOpenCV.readImage = function(inputImagePath) {
  return new Promise(function(resolve, reject) {
    cv.readImage(inputImagePath, (err, im) => {
      if (err) reject(err)
      coordOpenCV.im = im
      if (im.width() < 1 || im.height() < 1) reject('Image has no size')
      coordOpenCV.matrix = new cv.Matrix(im.height(), im.width());
      resolve(coordOpenCV)
    })
  })
}

module.exports = coordOpenCV
