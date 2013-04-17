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
 * @param {String} [params.engine="auto"] Engine to use (canvas, gm, or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with (top-down or user-defined via Spritesmith.addAlgorithm)
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

    // Begin attempting to load the engines
    engine = engines.canvas || engines.gm;

    // Assert there is an engine
    assert(engine, 'Sorry, no spritesmith engine could be loaded for your machine. Please be sure you have installed canvas or gm.');
  }

  // Create our smiths
  var engineSmith = new EngineSmith(engine),
      layer = new Layout(algorithmPref),
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
        layer.addItem({'width': img.width, 'height': img.height, 'meta': img});
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
        var img = item.meta,
            name = img._filepath;
        coordinates[name] = {
          'x': item.x,
          'y': item.y,
          'width': item.width,
          'height': item.height
        };
      });

      // Save the coordinates
      retObj.coordinates = coordinates;

      // Continue
      cb(null);
    },
    // Then, generate a canvas
    function generateCanvas (cb) {
      // If there are items, generate the canvas
      if (packedObj.items.length) {
        var width = packedObj.width,
            height = packedObj.height;
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
    gmEngine;
try {
  canvasEngine = require('./engines/canvas.engine.js');
} catch (e) {}

try {
  gmEngine = require('./engines/gm.engine.js');
} catch (e) {}

if (canvasEngine) { addEngine('canvas', canvasEngine); }
if (gmEngine) { addEngine('gm', gmEngine); }

// Expose utils
Spritesmith.utils = require('./utils');

// Export Spritesmith
module.exports = Spritesmith;