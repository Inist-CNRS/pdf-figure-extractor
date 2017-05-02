const Jimp = require('jimp')
const exec = require('child_process').exec
const fs = require('fs')
const easyimg = require('easyimage')

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

module.exports.cropImage = function(arrayOfRectangle, input ,output) {
  console.log(arrayOfRectangle);
  for (var i = 0; i < arrayOfRectangle.length; i++) {
    console.log(+arrayOfRectangle[i].w);
    easyimg.crop({
      gravity: "NorthWest",
      src: input,
      dst: output + '/part' + i + '.png',
      cropwidth: +arrayOfRectangle[i].w,
      cropheight: +arrayOfRectangle[i].h,
      x: +arrayOfRectangle[i].x,
      y: +arrayOfRectangle[i].y
    }).catch(err=>console.log(err))
  }
}

/*
 *  Write area on an image with Jimp to preview a behavior
 *  input: (imageToDraw, imageDraw, arrayOfPoint:[{x, y, w, h},...])
 *  output: void
 */
module.exports.writeOnImage = function(inputImagePath, outputImagePath, arrayOfPoint) {
  Jimp.read(inputImagePath).then((image) => {
    arrayOfPoint.forEach(coord => {
      for (let x = coord.x; x < Number(coord.x) + Number(coord.w); x++) {
        for (let y = coord.y; y < Number(coord.y) + Number(coord.h); y++) {
          image.setPixelColor(Jimp.rgbaToInt(255, 0, 0, 255), +x, +y);
        }
      }
    })
    image.write(outputImagePath)
  }).catch(err => console.error(err))
}

/*
 *  Create an Hocr with an image on input
 *  input: (imagePath, filename)
 *  output: put an image in the output folder
 */
module.exports.createHocr = function(imagePath, filename) {
  return new Promise((resolve, reject) => {
    const output = filename.replace(/\.[^/.]+$/, "")
    if (!fs.existsSync(filename)) {
      exec('tesseract ' + imagePath + ' ' + output + " hocr", (err, stdout, stderr) => {
        if (err) reject(err)
        resolve('tesseract')
      })
    } else resolve()
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
