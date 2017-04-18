const Tqi = require('text-quality-indicator'),
    tqi = new Tqi();

// correct/mispelled words are disable by default. To activate it :
const options = {}

// Analyze a file
tqi.analyze('tesseract.txt', options).then((result) => {
  console.log("ocr on all the document: ", result );
})


tqi.analyze('ocr_parts.txt', options).then((result) => {
  console.log("ocr on the parts of document: ", result );
  console.log("totalToken: ", result );
})
