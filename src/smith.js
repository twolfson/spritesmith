var async = require('async'),
    fs = require('fs'),
    engines = {};

// Attempt to load canvas
try {
  engines.canvas = require('./engines/canvas');
} catch (e) {
}

// // Attempt to load imagemagick
// try {
  // engine = require('gm');
  // engines.imagemagick = engine;
// } catch (e) {
// }

// Generate the spritesmith function
// TODO: Allow for quality specification, output type
// function Spritesmith(files, options callback) {
function Spritesmith(files, callback) {
  var retObj = {};

  // In a waterfall fashion
  async.waterfall([
    // Retrieve the files as buffers
    function smithRetrieveFiles (cb) {
      async.map(files, function (file, cb) {
        // Read in the file
        fs.readFile(file, function (err, buffer) {
          // If there is an error, callback with it
          if (err) {
            cb(err);
          } else {
          // Otherwise, write the path to the buffer and callback
            buffer.path = file;
            cb(null, buffer);
          }
        });
      }, cb);
    },
    function grabImages (files, cb) {
      // TODO: Predict the optimum size canvas
      // Map the files into their image counterparts
      var images = files.map(function (file) {
        var img = new Image();
        img.src = file;

        // Save the buffer path to the image
        img.path = file.path;

        // Retunr the image
        return img;
      });

      // Callback with the images
      cb(null, images);
    },
    // Then, create a canvas and the files to it
    function smithAddFiles (images, cb) {
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
          currentHeight = 0,
          coords = {};

      // Add the images to the canvas
      // TODO: Use a better algorithm
      // TODO: Should this be async.each?
      images.forEach(function (img) {
        // Save the image properties
        var x = 0,
            y = currentHeight,
            imgWidth = img.width,
            imgHeight = img.height;

        // Draw the image at the current height
        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        // Add the img.height to the current height
        currentHeight += imgHeight;

        // Save the coordinates for this image
        coords[img.path] = {
          'x': x,
          'y': y,
          'height': imgHeight,
          'width': imgWidth
        };
      });

      // Save the coordinates to retObj
      retObj.coordinates = coords;

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