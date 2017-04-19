const AreaHocr = require('./modules/hocrArea')
const Jimp = require('jimp')
const exec = require('child_process').exec
const options = require('./conf.json')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))

const filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
const outputFile = options.destinationDirectory + '/' + filename + '.txt'


Jimp.read(options.source).then(function (image) {
  const hocr = new AreaHocr(options.hocr)
  const arrayOfArea = hocr.area() // on recupere les areas dans le DOM

  return bluebird.map(arrayOfArea, (area, index) => {
    const newImage = image.clone() // Pour ne pas cropper directement l'image en elle meme
    newImage.crop(+area.x1, +area.y1, +area.width, +area.height) // croppe les areas
    return analyseImage(newImage, index)  // analyse des images sous forme asynchrone
  }).then((values) => {
    return values.sort((curr, next) => curr.i - next.i)
  }).map((value) => {
    return fs.appendFileAsync(outputFile, value.stdout)
  })
}).catch(function (err) {
  console.log(err)
})


function analyseImage(image, i) {
  return new Promise(function (resolve, reject) {
    image.write(options.tmpDirectory + '/part' + i + '.png', () => {
      exec('tesseract ' + options.tmpDirectory + '/part' + i + '.png stdout', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({i, stdout})
        }
      })
    })
  })
}
