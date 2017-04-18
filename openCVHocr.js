let AreaHocr = require('./modules/hocrArea')
let Jimp = require('jimp')
var fs = require('fs');
const child_process = require('child_process')
let options = require('./conf.json')

let filename = options.source.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "")
let outputFile = options.destinationDirectory + '/' + filename + '.txt'


let hocr = new AreaHocr(options.hocr)
Jimp.read(options.source).then(function (image) {
  let arrayOfArea = hocr.area() // on recupere les areas dans le DOM
  let arrayOfWritePromise = []  // tableaux servant à éxecuter les analyses des parties de fichiers
  for (let i = 0; i < arrayOfArea.length; i++) {
    let newImage = image.clone() // Pour ne pas cropper directement l'image en elle meme
    newImage
      .crop( +arrayOfArea[i].x1, +arrayOfArea[i].y1, +arrayOfArea[i].width, +arrayOfArea[i].height) // croppe les areas
    arrayOfWritePromise.push(analyseImage(newImage, i)) // analyse des images sous forme asynchrone
  }
  Promise.all(arrayOfWritePromise).then((values) => {
    values.sort((curr,next)=>curr.i - next.i)
      for (let i = 0; i < values.length; i++) {
        fs.appendFile(outputFile, values[i].stdout, function (err) {
          if (err) throw err;
        });
      }

  })
}).catch(function (err) {
    console.log(err)
})


function analyseImage(image, i) {
  return new Promise(function(resolve, reject) {
    image.write(options.tmpDirectory + '/part' + i + '.png', _ => {
      child_process.exec('tesseract ' + options.tmpDirectory + '/part' + i + '.png stdout', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            i,
            stdout
          })
        }
      })
    })
  });
}
