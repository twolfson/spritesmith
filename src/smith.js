var async = require('async'),
    assert = require('assert'),
    engines = {};

function sum(a, b) {
  return a + b;
}
function getImageStats(images) {
  // Pluck the width and heights of the images
  var imgHeights = images.map(function (img) {
        return img.height;
      }),
      imgWidths = images.map(function (img) {
        return img.width;
      });

  // Determine the maximums and totals
  var retVal = {
    'heights': imgHeights,
    'widths': imgWidths,
    'maxHeight': Math.max.apply(Math, imgHeights),
    'maxWidth': Math.max.apply(Math, imgWidths),
    'totalHeight': imgHeights.reduce(sum, 0),
    'totalWidth': imgWidths.reduce(sum, 0)
  };

  // Return all the info
  return retVal;
}

function Smithy(engine) {
  this.engine = engine;
}
Smithy.prototype = {
  // Create an image from a file via the engine
  'createImage': function (file, cb) {
    var engine = this.engine;
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
  },
  // Sugar function for creating multiple images
  'createImages': function (files, cb) {
    // Map the files into their image counterparts
    async.map(files, this.createImage.bind(this), cb);
  },
  // Collector for image stats
  'getImageStats': getImageStats,
  // Helper to create canvas via engine
  'createCanvas': function (width, height, cb) {
    var engine = this.engine;
    return engine.createCanvas(width, height, cb);
  },
  'packCanvas': function (canvas, algorithm, cb) {

  }
};

/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="auto"] Engine to use (canvas, gm, or user-defined via Spritesmith.addEngine)
 * TODO: engineOpts is not yet available
 * @param {String} [params.algorithm] Algorithm to pack images with (vertical or user-defined via Spritesmith.addAlgorithm)
 * @param {Mixed} [params.engineOpts] Options to pass through to engine
 * @param {Function} callback Function that receives compiled spritesheet and map
 */
function Spritesmith(params, callback) {
  var retObj = {},
      files = params.src,
      enginePref = params.engine || 'auto',
      engine = engines[enginePref];

  // If the engine is not defined
  if (engine === undefined) {
    // If the engine was not auto, inform the user
    assert.strictEqual(enginePref, 'auto', 'Sorry, the spritesmith engine \'' + enginePref + '\' could not be loaded. Please be sure you have installed it properly on your machine.');

    // Begin attempting to load the engines
    engine = engines.canvas || engines.gm;

    // Assert there is an engine
    assert(engine, 'Sorry, no spritesmith engine could be loaded for your machine. Please be sure you have installed canvas or gm.');
  }

  var smith = new Smithy(engine);

  // In a waterfall fashion
  async.waterfall([
    function grabImages (cb) {
      // Map the files into their image counterparts
      smith.createImages(files, cb);
    },
    // Then, create a canvas and the files to it
    function smithAddFiles (images, cb) {
      // TODO: Predict the optimum size canvas
      var imgStats = smith.getImageStats(images),
          maxWidth = imgStats.maxWidth,
          totalHeight = imgStats.totalHeight;

      // Create a canvas
      async.waterfall([
        function createCanvasFn (cb) {
          smith.createCanvas(maxWidth, totalHeight, cb);
        },
        function addImagesFn (canvas, cb) {
          var currentHeight = 0,
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
        }
      ], cb);
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

/**
 * Method to add new engines via
 * @param {String} name Name of engine
 * @param {Function} engine Engine to bind under name
 */
function addEngine(name, engine) {
  engines[name] = engine;
}
Spritesmith.addEngine = addEngine;


// Attempt to load canvas and imagemagick
var canvasEngine,
    gmEngine;
try {
  canvasEngine = require('./engines/canvas');
} catch (e) {}

try {
  gmEngine = require('./engines/gm');
} catch (e) {}

if (canvasEngine) { addEngine('canvas', canvasEngine); }
if (gmEngine) { addEngine('gm', gmEngine); }

// Export Spritesmith
module.exports = Spritesmith;