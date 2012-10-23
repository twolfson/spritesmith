var async = require('async'),
    assert = require('assert'),
    EngineSmith = require('./smiths/engine.smith.js'),
    PackingSmith = require('./smiths/packing.smith.js'),
    CanvasSmith = require('./smiths/canvas.smith.js'),
    engines = {},
    algorithms = {};

/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="auto"] Engine to use (canvas, gm, or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with (top-down or user-defined via Spritesmith.addAlgorithm)
 * @param {Mixed} [params.exportOpts] Options to pass through to engine for export
 * @param {Function} callback Function that receives compiled spritesheet and map
 */
function Spritesmith(params, callback) {
  var retObj = {},
      files = params.src,
      enginePref = params.engine || 'auto',
      engine = engines[enginePref],
      algorithmPref = params.algorithm || 'top-down',
      algorithm = algorithms[algorithmPref];

  // If the engine is not defined
  if (engine === undefined) {
    // If the engine was not auto, inform the user
    assert.strictEqual(enginePref, 'auto', 'Sorry, the spritesmith engine \'' + enginePref + '\' could not be loaded. Please be sure you have installed it properly on your machine.');

    // Begin attempting to load the engines
    engine = engines.canvas || engines.gm;

    // Assert there is an engine
    assert(engine, 'Sorry, no spritesmith engine could be loaded for your machine. Please be sure you have installed canvas or gm.');
  }

  // Assert we have an algorithm
  assert(algorithm, 'Sorry, the \'' + algorithmPref +'\' spritesmith algorithm could not be loaded.');

  // Create our smiths
  var engineSmith = new EngineSmith(engine),
      packingSmith = new PackingSmith(algorithm),
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
        var name = img._filepath;
        packingSmith.addItem(name, img);
      });

      // Callback with nothing
      cb(null);
    },
    // Then, output the coordinates
    function smithOutputCoordinates (cb) {
      // Export and saved packedObj for later
      packedObj = packingSmith['export']();

      // Save the coordinates
      retObj.coordinates = packedObj.coordinates;

      // Continue
      cb(null);
    },
    // Then, generate a canvas
    function generateCanvas (cb) {
    // Generate a canvas
      var width = packedObj.width,
          height = packedObj.height;
      engine.createCanvas(width, height, cb);
    },
    // Then, export the canvas
    function exportCanvas (canvas, cb) {
      // Create a CanvasSmithy
      var canvasSmith = new CanvasSmith(canvas);

      // Grab the images
      var images = packedObj.itemMap;

      // Add the images onto canvasSmith
      canvasSmith.addImageMap(images);

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
Spritesmith.PackingSmith = PackingSmith;
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

/**
 * Method to add new algorithms via
 * @param {String} name Name of algorithm
 * @param {Function} algorithm Algorithm to bind under name
 */
function addAlgorithm(name, algorithm) {
  // Save the algorithm to algorithms
  algorithms[name] = algorithm;
}
// Make algorithms easier to add
Spritesmith.addAlgorithm = addAlgorithm;
Spritesmith.algorithms = algorithms;

// Add default algorithms
addAlgorithm('top-down', require('./algorithms/top-down.algorithm.js'));
addAlgorithm('bottom-up', require('./algorithms/bottom-up.algorithm.js'));
addAlgorithm('left-right', require('./algorithms/left-right.algorithm.js'));
addAlgorithm('right-left', require('./algorithms/right-left.algorithm.js'));
addAlgorithm('diagonal', require('./algorithms/diagonal.algorithm.js'));
addAlgorithm('negative-diagonal', require('./algorithms/negative-diagonal.algorithm.js'));
addAlgorithm('reverse-diagonal', require('./algorithms/reverse-diagonal.algorithm.js'));

// Expose utils
Spritesmith.utils = require('./utils');

// Export Spritesmith
module.exports = Spritesmith;