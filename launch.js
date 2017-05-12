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

var im = require('imagemagick');
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
  const dirpdf = path.resolve(__dirname, program.input)
  const dirimages = path.resolve(__dirname, program.output)
  console.log('============Convert pdf to img==============');
  console.time('convert')
  fs.readdirAsync(dirpdf).map(function(file) {
      if (path.extname(file) === '.pdf') {
        return
        // pdfToImg(path.resolve(dirpdf, file))
      }
    }, {
      concurrency: 1
    })
    // .then(function() {
    //   console.timeEnd('convert')
    //   console.log('============Preprocessing==============')
    //   console.time('preprocessing')
    //   return fs.readdirAsync(path.resolve(__dirname, 'tmp')).map(function(file) {
    //     if (path.extname(file) === '.png') {
    //       return preprocessing(path.resolve(__dirname, 'tmp', file))
    //     }
    //   }, {
    //     concurrency: 2
    //   })
    // })
    .then(function() {
      console.timeEnd('preprocessing')
      console.log('============Execution==============');
      console.time('execution')
      return fs.readdirAsync(path.resolve(__dirname, 'tmp')).map(function(file) {
        if (path.extname(file) === '.png') {
          return new Coincides().init({
            imageInputPath: path.resolve(__dirname, 'tmp', file),
            directoryOutputPath: dirimages
          }).then((self) => {
            return self.exec()
          })
        }
      }, {
        concurrency: 4
      })
    }).then(_=>{
      console.timeEnd('execution')
    })
    .catch(err => console.error(err))
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
    console.log('filter to ', file);
    gm(file).contrast(-7).gamma(0.2, 0.2, 0.2).colorspace('GRAY').write(file, err => {
      if (err) throw err
      resolve()
    })
  })
}
