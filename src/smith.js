var async = require('async'),
    assert = require('assert'),
    EngineSmith = require('./smiths/engine.smith.js'),
    PackingSmith = require('./smiths/packing.smith.js'),
    CanvasSmith = require('./smiths/canvas.smith.js'),
    engines = {};

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

  // Create our smiths
  var engineSmith = new EngineSmith(engine),
      packingSmith = new PackingSmith('auto');

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
        packingSmith.addImage(name, img);
      });

      // Callback with nothing
      cb(null);
    },
    // Then, output the coordinates
    function smithOutputCoordinates (cb) {
      var coords = packingSmith.coords;
      retObj.coordinates = coords;
      cb(null);
    },
    // Then, generate a canvas
    function generateCanvas (cb) {
      packingSmith.generateCanvas(engine, cb);
    },
    // Then, export the canvas
    function exportCanvas (canvas, cb) {
      // Create a CanvasSmithy
      var canvasSmith = new CanvasSmith(canvas);

      // Grab the images
      var images = packingSmith.exportItems();

      // Add the images onto canvasSmith
      canvasSmith.addImageMap(images);

      // Export our canvas
      canvasSmith['export']({}, cb);
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