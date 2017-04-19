const AreaHocr = require('./modules/hocrArea')
const exec = require('child_process').exec
const bluebird = require('bluebird')
const easyimg = require('easyimage')
const fs = bluebird.promisifyAll(require('fs'))




class openCVHocr {
  constructor(options) {
    this.options = options
    this.filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
    this.arrayOfArea = new AreaHocr(options.destinationDirectory + '/' + this.filename + '.hocr').area()
    this.outputFile = options.destinationDirectory + '/' + this.filename + '.txt'

    if (fs.existsSync(this.outputFile)) {
      fs.unlinkSync(this.outputFile);
    }
  }

  exec() {
    return bluebird.map(this.arrayOfArea, (area, index) => {
      return this.analyseImage(index, area) // analyse des images sous forme asynchrone
    }, {
      concurrency: 30
    }).then((values) => {
      return values.sort((curr, next) => curr.i - next.i)
    }).map((value) => {
      return fs.appendFileAsync(this.outputFile, value.stdout)
    }).then(_ => {
      console.timeEnd("execution");
    })
  }

  analyseImage(i, area) {
    return new Promise((resolve, reject) => {
      const options = this.options
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
}

console.time("execution");
new openCVHocr({
  "source": "images/test1.png",
  "destinationDirectory": "output",
  "tmpDirectory": "tmp"
}).exec()

module.exports = openCVHocr
