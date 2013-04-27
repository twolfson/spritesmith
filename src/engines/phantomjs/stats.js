// Load in modules
var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage'),
    _  = require('./nimble.min.js');

// Grab the arguments
var args = system.args,
    filepath = args[1],
    encodedFilesStr = fs.read(filepath);

// If there is no image, throw an error
if (!encodedFilesStr) {
  throw new Error('No images specified to grab stats from.');
}

// Parse the image paths
var imgsStr = decodeURIComponent(encodedFilesStr),
    imgs = JSON.parse(imgsStr);

// In parallel
_.map(imgs, function getStats (img, cb) {
  // Load in the image
  // DEV: If this fails, use data/html
  var page = webpage.create();
  page.open(img, function (status) {
    // Pluck out the image dimensions
    var dimensions = page.evaluate(function () {
      // Grab the image
      var img = document.getElementsByTagName('img')[0];

      // Get the dimensions of the image
      var style = window.getComputedStyle(img),
          dimensions = {
            width: style.width,
            height: style.height
          };
      return dimensions;
    });

    // Adjust the dimensions off of `px`
    dimensions.height = +(dimensions.height.replace('px', ''));
    dimensions.width = +(dimensions.width.replace('px', ''));

    // Callback with the dimensions
    cb(null, dimensions);
  });
}, function handleStats (err, dimensionArr) {
  // Stringify and emit the dimensions
  var retStr = JSON.stringify(dimensionArr);
  console.log(retStr);

  // Leave the program
  phantom.exit();
});

