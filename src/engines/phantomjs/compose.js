// Load in modules
var system = require('system'),
    webpage = require('webpage');

// Grab the arguments
var args = system.args,
    encodedArg = args[1];

// If there is no image, throw an error
if (!encodedArg) {
  throw new Error('No argument was specified.');
}

// Load the compose webpage
var page = webpage.create();
page.open(phantom.libraryPath + '/compose.html?' + encodedArg, function (status) {
  // Pluck out the data png
  var retStr = page.evaluate(function () {
    return window.retStr;
  });
  console.log(retStr);

  // Leave the program
  phantom.exit();
});
