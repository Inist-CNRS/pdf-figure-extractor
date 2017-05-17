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
coincides -h            

  Usage: launch [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -o, --output <path>  Directory to put results
    -i, --input <path>   Directory to process

```

For instance:

``` bash
coincides --input "pdf" --output "output"
```

If you want to execute as a module:

``` javascript
const Coincides = require('./Coincides')

const config = {
  pdfInputPath: path.resolve(dirpdf, file),
  directoryOutputPath: output,
  tmp: tmp,
  debug:true
}
new Coincides(config).then((self) => {
  return self.exec()
}).catch(err=>console.log(err))

```
