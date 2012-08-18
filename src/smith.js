var async = require('async'),
    fs = require('fs'),
    Canvas = require('canvas'),
    Image = Canvas.Image;

// Generate the spritesmith function
// TODO: Allow for quality specification, output type
function Spritesmith(files, callback) {
  // In a waterfall fashion
  async.waterfall([
    // Retrieve the files as buffers
    function smithRetrieveFiles (cb) {
      async.map(files, function (file, cb) {
        fs.readFile(file, cb);
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
        ctx.drawImage(img, 0, 0, img.width, img.height);
      });

      // Callback with the canvas
      cb(null, canvas);
    },
    // Then, callback with the output canvas
    function outputCanvas (canvas, cb) {
      var retData = "",
          pngStream = canvas.createPNGStream();
      pngStream.on('data', function (chunk) {
        retData += chunk;
      });
      pngStream.on('end', function () {
        cb(null, retData);
      });
    }
  ], callback);
}

// Export Spritesmith
module.exports = Spritesmith;