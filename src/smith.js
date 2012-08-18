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
      // Map the files into their image counterparts
      var images = files.map(function (file) {
        var img = new Image();
        img.src = file;
        return img;
      });

      // Pluck the width and heights of the images
      var imgHeights = images.map(function (img) {
            return img.height;
          }),
          imgWidths = images.map(function (img) {
            return img.width;
          });

      // Determine the maximum width and sum the heights
      var maxWidth = Math.max.apply(Math, imgWidths),
          totalHeight = imgHeights.reduce(function (a, b) {
            return a + b;
          }, 0);

      // Create a canvas
      var canvas = new Canvas(maxWidth, totalHeight),
          ctx = canvas.getContext('2d'),
          currentHeight = 0;

      // Add the images to the canvas
      // TODO: Use a better algorithm
      // TODO: Should this be async.each?
      images.forEach(function (img) {
        // Save the image.height
        var imgHeight = img.height;

        // Draw the image at the current height
        ctx.drawImage(img, 0, currentHeight, img.width, imgHeight);

        // Add the img.height to the current height
        currentHeight += imgHeight;
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