var async = require('async'),
    fs = require('fs'),
    Canvas = require('canvas'),
    Image = Canvas.Image;

// Generate the spritesmith function
function Spritesmith(files, callback) {
  // In a waterfall fashion
  async.waterfall([
    // Retrieve the files
    function smithRetrieveFiles (cb) {
      async.map(files, function (file, cb) {
        fs.readFile(file, 'utf8', cb);
      }, cb);
    },
    // Then, create a canvas and the files to it
    function smithAddFiles (files, cb) {
      // TODO: Predict the optimum size canvas
      // Create a canvas
      var canvas = new Canvas(100, 100),
          ctx = canvas.getContext('2d');

      // Add the files to the canvas
      // TODO: Use a better algorithm
      // TODO: Should this be async.each?
      files.forEach(function (file) {
        // Create an Image from the file
        var img = new Image();
        img.src = file;
        // ctx.drawImage(img, 0, 0, img.width, img.height);
      });
// console.log(canvas.toDataUrl(function (err, data) {
// console.log(arguments);
// }));
      // Callback with the canvas
      cb(null, canvas);
    },
    // Then, callback with the output canvas
    function tempCallback() {
      arguments[arguments.length - 1](null, '2');
    }
  ], callback);
}

// Export Spritesmith
module.exports = Spritesmith;