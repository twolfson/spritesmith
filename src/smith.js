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

function EngineSmithy(engine) {
  this.engine = engine;
}
EngineSmithy.prototype = {
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
  }
};

function CanvasSmithy(algorithm) {
  this.images = {};
  this.coords = {};

  // TODO: Load in via .addAlgorithm
  this.algorithm = function (name, img) {
    var y = this.y || 0,
        imgHeight = img.height;

    // The image will be saved at the current height
    var saveImg = {
          'x': 0,
          'y': y,
          'height': img.height,
          'width': img.width
        };

    // Increment the y
    this.y = y + imgHeight;

    // Return the save image
    return saveImg;
  };
}
CanvasSmithy.prototype = {
  'addImage': function (name, img) {
    // Add the image
    var coords = this.algorithm(name, img),
        saveObj = {
          'name': name,
          'coords': coords,
          'img': img,
          'x': coords.x,
          'y': coords.y
        };
    this.images[name] = saveObj;
    this.coords[name] = coords;
  },
  'exportCoordinates': function () {
    // Return the coordinates
    return this.coords;
  },
  'getStats': function () {
    // TODO: Deprecate imgStats
    // Collect each of the coordinates into an array
    var coords = this.coords,
        coordNames = Object.getOwnPropertyNames(coords),
        coordArr = coordNames.map(function (name) {
          return coords[name];
        });

    // Get the endX and endY for each image
    var endXArr = coordArr.map(function (coord) {
          return coord.x + coord.width;
        }),
        endYArr = coordArr.map(function (coord) {
          return coord.y + coord.height;
        });

    // Get the maximums of these
    var retObj = {
          'maxHeight': Math.max.apply(Math, endYArr),
          'maxWidth': Math.max.apply(Math, endXArr)
        };

    // Return the stats
    return retObj;
  },
  'exportToCanvas': function (engine, options, cb) {
    // Grab the stats
    var stats = this.getStats(),
        maxHeight = stats.maxHeight,
        maxWidth = stats.maxWidth,
        that = this;

    async.waterfall([
      // Generate a canvas
      function generateCanvas (cb) {
        engine.createCanvas(maxWidth, maxHeight, cb)
      },
      // Add the images
      function addImages (canvas, cb) {
        var images = that.images,
            imageNames = Object.getOwnPropertyNames(images);
        imageNames.forEach(function (name) {
          var image = images[name],
              img = image.img,
              x = image.x,
              y = image.y;
          canvas.addImage(img, x, y);
        });

        // Callback with the canvas
        cb(null, canvas);
      },
      // Export the canvas
      function exportCanvas (canvas, cb) {
        // TODO: Use export options here
        canvas['export']('png', cb);
      }
    ], cb);
  },
  'export': function () {
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

  // Get our smithies
  var engineSmith = new EngineSmithy(engine),
      canvasSmith = new CanvasSmithy('auto');

  // In a waterfall fashion
  async.waterfall([
    function grabImages (cb) {
      // Map the files into their image counterparts
      engineSmith.createImages(files, cb);
    },
    // Then, add the images to our canvas (dry run)
    function smithAddFiles (images, cb) {
      images.forEach(function (img) {
        var name = img._filepath;
        canvasSmith.addImage(name, img);
      });

      // Callback with nothing
      cb(null);
    },
    // Then, output the coordinates
    function smithOutputCoordinates (cb) {
      var coords = canvasSmith.coords;
      retObj.coordinates = coords;
      cb(null);
    },
    // Then, callback with the output canvas
    function smithOutputCanvas (cb) {
      canvasSmith.exportToCanvas(engine, {}, cb);
    },
    function saveImageToRetObj(imgStr, cb) {
      // Save the image to the retObj
      retObj.image = imgStr;

      // Callback
      cb(null);
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