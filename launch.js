const fs= require('fs')
let Coincides = require('./Coincides')


const dir = 'test/images/'
fs.readdir(dir, (err, files) => {
  files.forEach(file => {
    console.log(file);
    Coincides.init({
      imageInputPath: dir + file,
      directoryOutputPath: './output'
    }).then((self) => {
      console.dir(self);
      self.exec()
    }).catch(err => {
      console.error(err)
    })

  })
})
