// Load in dependencies
var async = require('async');
var assert = require('assert');
var Layout = require('layout');
var EngineSmith = require('./smiths/engine.smith.js');
var CanvasSmith = require('./smiths/canvas.smith.js');

// Specify defaults
var engineDefault = 'pixelsmith';
var algorithmDefault = 'top-down';

/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="pixelsmith"] Engine to use (phantomjs, canvas, gm, pngsmith,
      or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with (top-down
      or user-defined via Spritesmith.addAlgorithm)
 * @param {Number} [params.padding] Padding to use between images
 * @param {Mixed} [params.exportOpts] Options to pass through to engine for export
 * @param {Function} callback Function that receives compiled spritesheet and map
 * @returns {Mixed} callback[0] err If an error was encountered, this will be returned to callback
 * @returns {Object} callback[1] result Result object of spritesmith
 * @returns {String} callback[1].image Binary string representation of image
 * @returns {Object} callback[1].coordinates Map from file name to an object containing x, y, height,
      and width information about the source image
 */
function Spritesmith(params, callback) {
  var retObj = {};
  var files = params.src;
  var engineName = params.engine || engineDefault;
  var engine = engineName;
  var algorithmName = params.algorithm || algorithmDefault;

  // If the engine is a `require` path, attempt to load it
  if (typeof engineName === 'string') {
    // Attempt to resolve the engine to verify it is installed at all
    try {
      require.resolve(engineName);
    } catch (err) {
      console.error('Attempted to find spritesmith engine "' + engineName + '" but could not.');
      console.error('Please verify you have installed "' + engineName + '" and saved it to your `package.json`');
      console.error('');
      console.error('    npm install ' + engineName);
      console.error('');
      throw err;
    }

    // Attempt to load the engine
    try {
      engine = require(engineName);
    } catch (err) {
      console.error('Attempted to load spritesmith engine "' + engineName + '" but could not.');
      console.error('Please verify you have installed its dependencies. Documentation should be available at ');
      console.error('');
      // TODO: Consider using pkg.repository
      console.error('    https://npm.im/' + encodeURIComponent(engineName));
      console.error('');
      throw err;
    }
  }

  // If there is a set parameter for the engine, use it
  if (engine.set) {
    var engineOpts = params.engineOpts || {};
    engine.set(engineOpts);
  }

  // Create our smiths
  var engineSmith = new EngineSmith(engine);
  var layer = new Layout(algorithmName, params.algorithmOpts);
  var padding = params.padding || 0;
  var exportOpts = params.exportOpts || {};
  var packedObj;

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
        var width = img.width;
        var height = img.height;
        var meta = {img: img, actualWidth: width, actualHeight: height};

        // Add the item with padding to our layer
        layer.addItem({
          width: width + padding,
          height: height + padding,
          meta: meta
        });
      });

      // Callback with nothing
      cb(null);
    },
    // Then, output the coordinates
    function smithOutputCoordinates (cb) {
      // Export and saved packedObj for later
      packedObj = layer['export']();

      // Extract the coordinates
      var coordinates = {};
      var packedItems = packedObj.items;
      packedItems.forEach(function (item) {
        var meta = item.meta;
        var img = meta.img;
        var name = img._filepath;
        coordinates[name] = {
          x: item.x,
          y: item.y,
          width: meta.actualWidth,
          height: meta.actualHeight
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
      var width = Math.max(packedObj.width || 0, 0);
      var height = Math.max(packedObj.height || 0, 0);

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
      try {
        canvasSmith.addImages(items);
      } catch (err) {
        return cb(err);
      }

      // Export our canvas
      canvasSmith['export'](exportOpts, cb);
    },
    function saveImageToRetObj (imgStr, cb) {
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

// Export Spritesmith
module.exports = Spritesmith;
