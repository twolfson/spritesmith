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
var page = webpage.create();
page.open(img, function (status) {
  console.log(status);
  phantom.exit();
});
// page.evaluateAsync(function (img) {

// }, img);
