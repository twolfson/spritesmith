// Load in modules
var system = require('system'),
    webpage = require('webpage');

// Grab the arguments
var args = system.args,
    img = args[1];

// If there is no image, throw an error
if (!img) {
  throw new Error('No image specified to grab stats from.');
}

// Load in the image
// DEV: If this fails, use data/html
var page = webpage.create();
page.open(img, function (status) {
  console.log(page.evaluate(function () {
    // Grab the image
    var img = document.getElementsByTagName('img')[0];

    // Get the dimensions of the image
    var style = window.getComputedStyle(img),
        retObj = {
          width: style.width,
          height: style.height
        };
    return JSON.stringify(retObj, null, 4);
  }));
  phantom.exit();
});
