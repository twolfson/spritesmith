// Load in modules
var system = require('system'),
    webpage = require('webpage');

// Grab the arguments
var args = system.args,
    arg = args[1];

// If there is no image, throw an error
if (!arg) {
  throw new Error('No argument was specified.');
}

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

  // Stringify and emit the dimensions
  var retStr = JSON.stringify(dimensions, null, 4);
  console.log(retStr);

  // Leave the program
  phantom.exit();
});
