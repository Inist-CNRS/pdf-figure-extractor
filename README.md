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

If you want to execute in command line interface: 

``` bash
./launch.js -h            

  Usage: launch [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -o, --output <path>  Directory to put results
    -i, --input <path>   Directory to process

```

For instance:

``` bash
./launch.js --input "./test/pdf" --output "./test/images"
```

If you want to execute as a module:

``` javascript
const Coincides = require('./Coincides')

const config = {
  imageInputPath: 'test/images/test1.png',
  imageOutputPath: 'test/output/test1.png'
}
new Coincides().init(config).then((self) => {
  return self.exec()
}).catch(err => {
  console.error(err);
})

```

Compare the tesseract before/after processing:
``` bash
npm run tqi
```
