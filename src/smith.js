var async = require('async'),
    assert = require('assert'),
    engines = {};

// Attempt to load canvas
try {
  engines.canvas = require('./engines/canvas');
} catch (e) {
}

// // Attempt to load imagemagick
try {
  engines.gm = require('./engines/gm');
} catch (e) {
}

// Generate the spritesmith function
// TODO: Allow for quality specification, output type
function Spritesmith(files, callback) {
  var retObj = {},
      engine = engines.canvas || engines.gm;
      
  // Assert there is an engine
  assert(engine, 'Sorry, no spritesmith engine could be loaded for your machine. Please be sure you have installed canvas or gm.');

  // In a waterfall fashion
  async.waterfall([
    function grabImages (cb) {
      // Map the files into their image counterparts
      async.map(files, function (file, cb) {
        async.waterfall([
          function createImage (cb) {
            engine.createImage(file, cb);
          },
          function savePath (img, cb) {
            // Save the buffer path to the image
            img._filepath = file;

            // Callback with the image
            cb(null, img);
          }
        ], cb);
      }, cb);
    },
    // Then, create a canvas and the files to it
    function smithAddFiles (images, cb) {
      // TODO: Predict the optimum size canvas
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
      var canvas = new engine(maxWidth, totalHeight),
          currentHeight = 0,
          coords = {};

      // Add the images to the canvas
      // TODO: Use a better algorithm
      // TODO: Should this be async.each
      images.forEach(function (img) {
        // Save the image properties
        var x = 0,
            y = currentHeight,
            imgWidth = img.width,
            imgHeight = img.height;

        // Draw the image at the current height
        canvas.addImage(img, x, y);

        // Add the img.height to the current height
        currentHeight += imgHeight;

        // Save the coordinates for this image
        coords[img._filepath] = {
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
      async.waterfall([
        // Export the canvas as a png
        function exportCanvas (cb) {
          canvas['export']('png', cb);
        },
        function saveImageToRetObj(imgStr, cb) {
          // Save the image to the retObj
          retObj.image = imgStr;

          // Callback
          cb(null);
        }
      ], cb);
    },
    function smithCallbackData (cb) {
      // Callback with the return object
      cb(null, retObj);
    }
  ], callback);
}

// Export Spritesmith
module.exports = Spritesmith;