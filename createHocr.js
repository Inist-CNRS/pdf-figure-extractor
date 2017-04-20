const exec = require('child_process').exec
const options = require('./conf.json')


const filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
const outputFile = options.destinationDirectory + '/' + filename

exec("tesseract " + options.source + " " + outputFile + " hocr")
