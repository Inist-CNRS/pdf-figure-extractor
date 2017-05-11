const Tqi = require('text-quality-indicator'),
    tqi = new Tqi();
const fs = require('fs');
const exec = require('child_process').exec
const Coincides = require('./Coincides')
const helpers = require('./modules/helpers')


const originImageFile = 'test/images/test1.png'
const updateImageFile = 'tmp/output.png'

const config = {
  imageInputPath: originImageFile,
  imageOutputPath: updateImageFile,
  hocrPath: 'tmp/update.hocr'
}

Coincides.init(config).then(() => {
  Coincides.exec()
}).then(_=>{
  exec('tesseract ' + originImageFile + ' tmp/update', (error, stdout, stderr) => {
    if(error) throw error
    tqi.analyze('tmp/update.txt').then((result) => {
      console.log("ocr on all the document: ", result );
    })


    // TODO: use a plain text
    tqi.analyze('tmp/output.txt').then((result) => {
      console.log("ocr on the modified document: ", result );
    })
  })
}).catch(err => {
  console.error(err);
})
