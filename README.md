# Coincides



#### Required Packages
Install dependencies:
``` bash
sudo apt-get install libopencv-dev libcv-dev libtesseract-dev  tesseract-ocr
```

***

### Installation

Install project dependencies:
``` bash
npm install
```

***

### Run

Compare the tesseract before/after processing:
``` bash
npm run tqi
```

If you want to execute as a module:

``` javascript
const Coincides = require('./Coincides')

const config = {
  imageInputPath: 'test/images/test1.png',
  imageOutputPath: 'test/output/test1.png'
}

Coincides.init(config).then(() => {
  Coincides.exec()
}).catch(err => {
  console.error(err);
})

```
