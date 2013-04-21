// Load in modules
var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage');

// Grab the arguments
var args = system.args,
    filepath = args[1],
    encodedArg = fs.read(filepath);

// If there is no image, throw an error
if (!encodedArg) {
  throw new Error('No argument was specified.');
}

// Load the compose webpage
var page = webpage.create();
page.open(phantom.libraryPath + '/compose.html?' + encodedArg, function (status) {
  // Pluck out the data png
  var dataUrl = page.evaluate(function () {
    return window.retStr;
  });

  // Remove the data/png
  var retStr = dataUrl.replace('data:image/png;base64,', '');
  console.log(retStr);

  // Leave the program
  phantom.exit();
});
