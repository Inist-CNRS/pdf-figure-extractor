#! /usr/bin/env node


const _ = require('lodash')
const path = require('path');
const bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require("fs"))
const Coincides = require('./Coincides')
const Ghostscript = require('ghostscript-js')
const helpers = require('./modules/helpers')
const mkdirp = bluebird.promisifyAll(require('mkdirp'))
const program = require('commander')
const Jimp = require('jimp')
const avgOfColor = require('./modules/avgOfColor')
const Tqi = require('text-quality-indicator'),
  tqi = new Tqi();

const gm = require('gm').subClass({
  imageMagick: true
});
const opencv = require('./modules/coordOpenCV')

let contrast = 1
let tolerance = 3
let main = {
  r: 0,
  g: 0,
  b: 0
}



program
  .version('0.0.1')
  .option('-o, --output <path>', 'Directory to put results')
  .option('-i, --input <path>', 'Directory to process')
  .parse(process.argv);


if (program.input && program.output) {


  new opencv().init('/home/labroche/Project/parseDocument/tmp/55C42D35948559292F9BF073A92BF13887E53F64002.png').then(_=>console.log('lkfjergf')).catch(err=>console.log(err))
    new opencv().init('/home/labroche/Project/parseDocument/tmp/55C42D35948559292F9BF073A92BF13887E53F64002.png').then(_=>console.log('lkfjergf')).catch(err=>console.log(err))


  //
  // const dirpdf = path.resolve(__dirname, program.input)
  // const dirimages = path.resolve(__dirname, program.output)
  // console.log('============Convert pdf to img==============');
  // fs.readdirAsync(dirpdf).map(function(file) {
  //     if (path.extname(file) === '.pdf') {
  //       return pdfToImg(path.resolve(dirpdf, file))
  //     }
  //   }, {
  //     concurrency: 1
  //   })
  //
  //
  //
  //
  //   .then(function() {
  //   console.log('============Preprocessing==============')
  //     return fs.readdirAsync(path.resolve(__dirname, 'tmp')).map(function(file) {
  //       if (path.extname(file) === '.png') {
  //         return preprocessing(path.resolve(__dirname, 'tmp', file))
  //       }
  //     }, {
  //       concurrency: 1
  //     })
  //   })
  //
  //
  //
  //
  //
  //   .then(function() {
  //     console.log('============Execution==============');
  //     return fs.readdirAsync(path.resolve(__dirname, 'tmp')).map(function(file) {
  //       if (path.extname(file) === '.png') {
  //         console.log(path.resolve(__dirname, 'tmp', file));
  //         return new Coincides().init({
  //           imageInputPath: path.resolve(__dirname, 'tmp', file),
  //           directoryOutputPath: dirimages
  //         }).then((self) => {
  //           return self.exec()
  //         })
  //       }
  //     }, {
  //       concurrency: 1
  //     })
  //   })
  //   .catch(err => console.error(`=================error=================== ${err}`))
}




function pdfToImg(fileToRead) {
  return new Promise(function(resolve, reject) {
    console.log(fileToRead);
    Ghostscript.exec([
    '-q',
    '-dNOPAUSE',
    '-dBATCH',
    '-sDEVICE=png16m',
    '-r300',
    '-sOutputFile=' + path.resolve(__dirname, 'tmp', helpers.getFilename(fileToRead) + '%03d.png'),
    fileToRead
    ], (codeError) => {
      if (codeError) reject(codeError)
      resolve(this)
    })
  })
}




function preprocessing(file) {
  return new Promise(function(resolve, reject) {

    let gamma = 0.8
    console.log('filter to ', file);
    //
    // gm(file).blur(1, 1).write(file,err=>resolve(err))

    // charcoal(number) => detouring    .charcoal(5).negative().contrast(1).sharpen(5,5)
    //
    // console.log(diff({r:255,g:255,b:255}, {r:210,g:210,b:210}));

    gm(file).contrast(-5).sharpen(10).write(file, err => {
      // Jimp.read(file).then((image) => {
      //   image = sanitize(image)
      //   image.write(file, _ => {
      //     resolve()
      //   })
      // }).catch(err => console.error(err))
      if (err) {
        console.log(err);
      }
      resolve()
    })

  })
}

function diff(color1, color2) {
  var difference = Math.sqrt(Math.abs((color1.r - color2.r) ^ 2 + (color1.g - color2.g) ^ 2 + (color1.b - color2.b) ^ 2))
  if (difference > 6) {
    return true

  } else {
    return false
  }
}

function effect(image) {
  // image.color([
  //   { apply: 'hue', params: [ -90 ] }
  // ]);
  image.greyscale()
}


function sanitize(image) {
  const h = image.bitmap.height
  const w = image.bitmap.width
  let iter = 2
  for (var y = iter; y < h - iter; y++) {
    for (var x = iter; x < w - iter; x++) {
      let sum = 0
      let color1 = Jimp.intToRGBA(image.getPixelColor(x, y))
      // if (((diff(Jimp.intToRGBA(image.getPixelColor(x + 1, y)), color1) &&
      //       diff(Jimp.intToRGBA(image.getPixelColor(x - 1, y)), color1)) ||
      //     (diff(Jimp.intToRGBA(image.getPixelColor(x, y + 1)), color1) &&
      //       diff(Jimp.intToRGBA(image.getPixelColor(x, y - 1)), color1)))
      //
      //       &&
      //       ((diff(Jimp.intToRGBA(image.getPixelColor(x + 2, y)), color1) &&
      //             diff(Jimp.intToRGBA(image.getPixelColor(x - 2, y)), color1)) ||
      //           (diff(Jimp.intToRGBA(image.getPixelColor(x, y + 2)), color1) &&
      //             diff(Jimp.intToRGBA(image.getPixelColor(x, y - 2)), color1)))
      //     ) {
      //   image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), +x, +y);
      // }
      if ((diff(Jimp.intToRGBA(image.getPixelColor(x + 1, y)), {
          r: 0,
          g: 0,
          b: 0
        }))) {
        image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), +x, +y);
      }
    }
  }


  return image
}
