#poc-hocrCV



####Required Packages
Install dependencies: 
``` bash
sudo apt-get install build-essential cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev
```

Clone version 2.4: 
``` bash
git clone -b 2.4 --single-branch https://github.com/opencv/opencv.git 
``` 

``` bash
cd opencv
``` 

Install opencv
``` bash
cmake ./
``` 

``` bash
sudo make install
``` 

Or in one line: 
``` bash
sudo apt-get install build-essential cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev && git clone -b 2.4 --single-branch https://github.com/opencv/opencv.git && cd opencv && cmake ./ && sudo make install
```

***

### Installation 

Install project dependencies: 
``` bash
npm install
``` 

***


### Configuration

You can modify inputs and outputs in conf.json

***


###Run 

Reload an hocr from the input image:
``` bash
npm run createHocr
``` 

Compare the tesseract before/after processing 
``` bash
npm run tqi
```
