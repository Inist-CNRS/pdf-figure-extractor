const AreaHocr = require('./modules/hocrArea')
const exec = require('child_process').exec
const options = require('./conf.json')
const bluebird = require('bluebird')
const easyimg = require('easyimage')
const fs = bluebird.promisifyAll(require('fs'))


const filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
const outputFile = options.destinationDirectory + '/' + filename + '.txt'
const hocrFilePath = options.destinationDirectory + '/' + filename + '.hocr'

console.time("execution");
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

const hocr = new AreaHocr(hocrFilePath)
const arrayOfArea = hocr.area() // on recupere les areas dans le DOM
return bluebird.map(arrayOfArea, (area, index) => {
  return analyseImage(index, area) // analyse des images sous forme asynchrone
}, {
  concurrency: 30
}).then((values) => {
  return values.sort((curr, next) => curr.i - next.i)
}).map((value) => {
  return fs.appendFileAsync(outputFile, value.stdout)
}).then(_ => {
  console.timeEnd("execution");
})


function analyseImage(i, area) {
  return new Promise((resolve, reject) => {
    easyimg.crop({
      src: options.source,
      dst: options.tmpDirectory + '/part' + i + '.png',
      cropwidth: +area.width,
      cropheight: +area.height,
      x: +area.x1,
      y: +area.y1
    }).then((image) => {
      exec('tesseract ' + options.tmpDirectory + '/part' + i + '.png stdout', (error, stdout, stderr) => {
        if (error) reject(error)
        else resolve({
          i,
          stdout
        })
      }, err => console.log(err))
    }).catch(err => console.log(err))
  })
}
