const exec = require('child_process').exec
const options = {
  "source": "images/test1.png",
  "destinationDirectory": "output",
  "tmpDirectory": "tmp"
}

const filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
const outputFile = options.destinationDirectory + '/' + filename

exec("tesseract " + options.source + " " + outputFile + " hocr")
