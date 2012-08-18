var async = require('async'),
    fs = require('fs'),
    Canvas = require('canvas'),
    Image = Canvas.Image;

// Generate the spritesmith function
// TODO: Allow for quality specification, output type
function Spritesmith(files, callback) {
  var retObj = {};

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
    function smithOutputCanvas (canvas, cb) {
      var pngStream = canvas.createPNGStream(),
          imgData = [],
          err;

      // On data, add it to imgData
      // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
      pngStream.on('data', function (chunk) {
        var binaryStr = chunk.toString('binary');
        imgData.push(binaryStr);
      });

      // On error, save it
      pngStream.on('error', function (_err) {
        err = _err;
      });

      // When complete
      pngStream.on('end', function () {
        // If there was an error, callback with it
        if (err) {
          cb(err);
        } else {
        // Otherwise, join together image data, put it into the retObj
          var retStr = imgData.join('');
          retObj.image = retStr;

          // Callback with no error
          cb(null);
        }
      });
    },
    function smithCallbackData (cb) {
      // Callback with the return object
      cb(null, retObj);
    }
  ], callback);
}

// Export Spritesmith
module.exports = Spritesmith;