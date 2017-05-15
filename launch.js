#! /usr/bin/env node


const _ = require('lodash')
const path = require('path');
const bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require("fs"))
const Coincides = require('./Coincides')
const helpers = require('./modules/helpers')
const mkdirp = bluebird.promisifyAll(require('mkdirp'))
const program = require('commander')
const Jimp = require('jimp')
const avgOfColor = require('./modules/avgOfColor')
const Tqi = require('text-quality-indicator'),
  tqi = new Tqi();

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
  fs.readdirAsync(dirpdf).mapSeries(function(file) {
    if (path.extname(file) === '.pdf') {
      return new Coincides().init({
        pdfInputPath: path.resolve(dirpdf, file),
        directoryOutputPath: dirimages
      }).then((self) => {
        return self.exec()
      }).then(_=>{
        console.log("-==========================================================================================================================");
        console.log();
      }).catch(err=>console.log(err))

    }
  })
}
