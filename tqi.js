const Tqi = require('text-quality-indicator'),
    tqi = new Tqi();
const fs = require('fs');
const exec = require('child_process').exec

const options = require('./conf.json')
const filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
const cropFile = options.destinationDirectory + '/' + filename + '.txt'
const tesseractFile = 'tmp/tesseract.txt'

exec('tesseract ' + options.source + ' tmp/tesseract', (error, stdout, stderr) => {
  tqi.analyze(tesseractFile).then((result) => {
    console.log("ocr on all the document: ", result );
  })

  tqi.analyze(cropFile).then((result) => {
    console.log("ocr on the parts of document: ", result );
  })
})
