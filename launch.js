const fs= require('fs')
const _ = require('lodash')
const path = require('path');
const bluebird = require('bluebird')
const Coincides = require('./Coincides')
const dir = path.resolve(__dirname, 'test/images/')
fs.readdir(dir, (err, files) => {
  files.forEach(file => {

  })
})

console.time('a')
fs.readdirAsync(dir).map(function(file) {
  return new Coincides().init({
    imageInputPath: path.resolve(dir,file),
    directoryOutputPath: './output'
  }).then((self) => {
    return self.exec()
  }).catch(err => {
    console.error(err)
  })
}, {concurrency: 3}).then(function() {
  console.timeEnd('a')
});
