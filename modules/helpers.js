const Jimp = require('jimp')
const exec = require('child_process').exec

let randomColor = function() {
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

function writeOnImage(source, destination, arrayOfPoint) {
  Jimp.read(source).then((image) => {
    arrayOfPoint.forEach(coord => {
      for (let x = coord.areaLeft; x < Number(coord.areaLeft) + Number(coord.areaWidth); x++) {
        for (let y = coord.areaTop; y < Number(coord.areaTop) + Number(coord.areaHeight); y++) {
          image.setPixelColor(Jimp.rgbaToInt(255, 0, 0, 255), +x, +y);
        }
      }
    })
    image.write(destination)
  })
}


function createHocr(imagePath, filename) {
  return new Promise((resolve, reject) => {
    const output = filename.replace(/\.[^/.]+$/, "")
    exec('tesseract ' + imagePath + ' ' + output + " hocr", (err, stdout, stderr) => {
      if (err) reject(err)
      resolve('tesseract')
    })
  })
}

function getFilename(path) {
  return path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
}

let helpers = {
  randomColor,
  writeOnImage,
  getFilename,
  createHocr
}
module.exports = helpers
