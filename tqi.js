const Tqi = require('text-quality-indicator'),
    tqi = new Tqi();
const fs = require('fs');
const exec = require('child_process').exec
const PocHocrCV = require('./poc-hocrCV')
const helpers = require('./modules/helpers')


const originImageFile = 'images/test1.png'
const updateImageFile = 'tmp/update.png'

const config = {
  imageInputPath: originImageFile,
  imageOutputPath: updateImageFile,
  hocrPath: 'tmp/update.hocr'
}

PocHocrCV.init(config).then(() => {
  PocHocrCV.exec()
}).then(_=>{
  exec('tesseract ' + originImageFile + ' tmp/update', (error, stdout, stderr) => {
    if(error) throw error
    tqi.analyze('tmp/update.txt').then((result) => {
      console.log("ocr on all the document: ", result );
    })


    // TODO: use a plain text
    tqi.analyze('tmp/update.txt').then((result) => {
      console.log("ocr on the parts of document: ", result );
    })
  })
}).catch(err => {
  console.error(err);
})
