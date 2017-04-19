const openCVHocr = require('./openCVHocr')


console.time("execution")
new openCVHocr({
  "source": "images/test1.png",
  "destinationDirectory": "output",
  "tmpDirectory": "tmp"
}).exec().then((result) => {
  console.timeEnd("execution")
})
