const Jimp = require('jimp')
const exec = require('child_process').exec


/*
  Get a random color
  input:void
  output: [r,g,b]
*/
module.exports.randomColor = function() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  var c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
    c = color.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255]
  }
  throw new Error('Bad Hex')
}


/*
*  Write area on an image with Jimp to preview a behavior
*  input: (imageToDraw, imageDraw, arrayOfPoint:[{areaLeft, areaTop, areaWidth, areaHeight},...])
*  output: void
*/
module.exports.writeOnImage = function(inputImagePath, outputImagePath, arrayOfPoint) {
  Jimp.read(inputImagePath).then((image) => {
    arrayOfPoint.forEach(coord => {
      for (let x = coord.areaLeft; x < Number(coord.areaLeft) + Number(coord.areaWidth); x++) {
        for (let y = coord.areaTop; y < Number(coord.areaTop) + Number(coord.areaHeight); y++) {
          image.setPixelColor(Jimp.rgbaToInt(255, 0, 0, 255), +x, +y);
        }
      }
    })
    image.write(outputImagePath)
  }).catch(err=>console.error(err))
}

/*
*  Create an Hocr with an image on input
*  input: (imagePath, filename)
*  output: put an image in the output folder
*/
module.exports.createHocr = function(imagePath, filename) {
  return new Promise((resolve, reject) => {
    const output = filename.replace(/\.[^/.]+$/, "")
    exec('tesseract ' + imagePath + ' ' + output + " hocr", (err, stdout, stderr) => {
      if (err) reject(err)
      resolve('tesseract')
    })
  })
}

/*
  Get a absolute path and return filename without extension
  input:(absolutePathToFile)
  output: filenameWithoutExtension
*/
module.exports.getFilename = function(path) {
  return path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
}