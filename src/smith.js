var async = require('async'),
    assert = require('assert'),
    EngineSmith = require('./smiths/engine.smith.js'),
    Layout = require('layout'),
    CanvasSmith = require('./smiths/canvas.smith.js'),
    engines = {};


/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="auto"] Engine to use (phantomjs, canvas, gm, pngsmith, or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with (top-down or user-defined via Spritesmith.addAlgorithm)
 * @param {Number} [params.padding] Padding to use between images
 * @param {Mixed} [params.exportOpts] Options to pass through to engine for export
 * @param {Function} callback Function that receives compiled spritesheet and map
 * @returns {Mixed} callback[0] err If an error was encountered, this will be returned to callback
 * @returns {Object} callback[1] result Result object of spritesmith
 * @returns {String} callback[1].image Binary string representation of image
 * @returns {Object} callback[1].coordinates Map from file name to an object containing x, y, height, and width information about the source image
 */
function Spritesmith(params, callback) {
  var retObj = {},
      files = params.src,
      enginePref = params.engine || 'auto',
      engine = engines[enginePref],
      algorithmPref = params.algorithm || 'top-down';

  // If the engine is not defined
  if (engine === undefined) {
    // If the engine was not auto, inform the user
    assert.strictEqual(enginePref, 'auto', 'Sorry, the spritesmith engine \'' + enginePref + '\' could not be loaded. Please be sure you have installed it properly on your machine.');

    // Begin attempting to load the engines (in order of hardest to easiest)
    engine = engines.canvas || engines.gm || engines.phantomjs || engines.pngsmith;

    // Assert there is an engine
    assert(engine, 'Sorry, no spritesmith engine could be loaded for your machine. Please be sure you have installed canvas or gm.');
  }

  // If there is a set parameter for the engine, use it
  if (engine.set) {
    var engineOpts = params.engineOpts || {};
    engine.set(engineOpts);
  }

  // Create our smiths
  var engineSmith = new EngineSmith(engine),
      layer = new Layout(algorithmPref),
      padding = params.padding || 0,
      exportOpts = params.exportOpts || {},
      packedObj;

  // In a waterfall fashion
  async.waterfall([
    function grabImages (cb) {
      // Map the files into their image counterparts
      engineSmith.createImages(files, cb);
    },
    // Then, add the images to our canvas (dry run)
    function smithAddFiles (images, cb) {
      images.forEach(function (img) {
        // Save the non-padded properties as meta data
        var width = img.width,
            height = img.height,
            meta = {'img': img, 'actualWidth': width, 'actualHeight': height};

        // Add the item with padding to our layer
        layer.addItem({'width': width + padding, 'height': height + padding, 'meta': meta});
      });

      // Callback with nothing
      cb(null);
    },
    // Then, output the coordinates
    function smithOutputCoordinates (cb) {
      // Export and saved packedObj for later
      packedObj = layer['export']();

      // Extract the coordinates
      var coordinates = {},
          packedItems = packedObj.items;
      packedItems.forEach(function (item) {
        var meta = item.meta,
            img = meta.img,
            name = img._filepath;
        coordinates[name] = {
          'x': item.x,
          'y': item.y,
          'width': meta.actualWidth,
          'height': meta.actualHeight
        };
      });

      // Save the coordinates
      retObj.coordinates = coordinates;

      // Continue
      cb(null);
    },
    // Then, generate a canvas
    function generateCanvas (cb) {
      // Grab and fallback the width/height
      var width = Math.max(packedObj.width || 0, 0),
          height = Math.max(packedObj.height || 0, 0);

      // If there are items
      var itemsExist = packedObj.items.length;
      if (itemsExist) {
        // Remove the last item's padding
        width -= padding;
        height -= padding;
      }

      // Export the total width and height of the generated canvas
      retObj.properties = {
        width: width,
        height: height
      };

      // If there are items, generate the canvas
      if (itemsExist) {
        engine.createCanvas(width, height, cb);
      } else {
      // Otherwise, skip over potential errors/CPU
        cb(null, '');
      }
    },
    // Then, export the canvas
    function exportCanvas (canvas, cb) {
      // If there is no canvas, callback with an empty string
      var items = packedObj.items;
      if (!canvas) {
        return cb(null, '');
      }

      // Create a CanvasSmithy
      var canvasSmith = new CanvasSmith(canvas);

      // Add the images onto canvasSmith
      canvasSmith.addImages(items);

      // Export our canvas
      canvasSmith['export'](exportOpts, cb);
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

// Add the smiths to Spritesmith
Spritesmith.EngineSmith = EngineSmith;
Spritesmith.Layout = Layout;
Spritesmith.CanvasSmith = CanvasSmith;

/**
 * Method to add new engines via
 * @param {String} name Name of engine
 * @param {Function} engine Engine to bind under name
 */
function addEngine(name, engine) {
  engines[name] = engine;
}
Spritesmith.addEngine = addEngine;
Spritesmith.engines = engines;

// Attempt to load canvas and imagemagick
var canvasEngine,
    gmEngine,
    phantomjsEngine,
    pngEngine;
try {
  canvasEngine = require('canvassmith');
} catch (e) {}

try {
  gmEngine = require('gmsmith');
} catch (e) {}

try {
  phantomjsEngine = require('phantomjssmith');
} catch (e) {}

try {
  pngEngine = require('pngsmith');
} catch (e) {}

if (canvasEngine) { addEngine('canvas', canvasEngine); }
if (gmEngine) { addEngine('gm', gmEngine); }
if (phantomjsEngine) { addEngine('phantomjs', phantomjsEngine); }
if (pngEngine) { addEngine('pngsmith', pngEngine); }

// Export Spritesmith
module.exports = Spritesmith;
