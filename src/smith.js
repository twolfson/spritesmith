// Load in dependencies
var async = require('async');
var Layout = require('layout');
var semver = require('semver');
var EngineSmith = require('./smiths/engine.smith.js');
var CanvasSmith = require('./smiths/canvas.smith.js');

// Specify defaults
var engineDefault = 'pixelsmith';
var algorithmDefault = 'binary-tree';
var SPEC_VERSION_RANGE = '>=1.1.0 <2.0.0';

// Define our spritesmith utility
// Gist of params: {src: files, engine: 'pixelsmith', algorithm: 'binary-tree'}
// Gist of result: {image: binary, coordinates: {filepath: {x, y, width, height}}, properties: {width, height}}
function spritesmith(params, callback) {
  // Set up return items and fallback parameters
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
      console.error('    npm install ' + engineName + ' --save-dev');
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
      // TODO: Consider using pkg.homepage and pkg.repository
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

  // Verify we are on a matching `specVersion`
  if (!semver.satisfies(engine.specVersion, SPEC_VERSION_RANGE)) {
    throw new Error('Expected `engine` to have `specVersion` within "' + SPEC_VERSION_RANGE + '" ' +
      'but it was "' + engine.specVersion + '". Please verify you are on the latest version of your engine: ' +
      '`npm install my-engine@latest`');
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

// Add the smiths to spritesmith
spritesmith.EngineSmith = EngineSmith;
spritesmith.Layout = Layout;
spritesmith.CanvasSmith = CanvasSmith;

// Export spritesmith
module.exports = spritesmith;
