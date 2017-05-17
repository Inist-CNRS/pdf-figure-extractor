# Pdf-figure-extractor

Extract figure from pdf without text in it

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
npm install -g pdf-figure-extractor
```
Usage:
``` bash
pdf-figure-extractor -h            

  Usage: launch [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -o, --output <path>  Directory to put results
    -i, --input <path>   Directory to process

```

For instance:

``` bash
pdf-figure-extractor --input "pdf" --output "output"
```

If you want to execute as a module:

``` javascript
const pfe = require('pdf-figure-extractor')

const config = {
  pdfInputPath: input,
  directoryOutputPath: output,
  tmp: tmp,
  debug:true
}
new pfe(config).then((self) => {
  return self.exec()
}).catch(err=>console.log(err))

```
