// Load in modules
var system = require('system'),
    webpage = require('webpage');

console.log('hebbby');
// Grab the arguments
var encodedArg = system.stdin.readLine();

console.log('hey');

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
