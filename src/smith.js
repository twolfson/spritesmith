// Load in dependencies
var async = require('async');
var Layout = require('layout');
var semver = require('semver');
var through2 = require('through2');

// Specify defaults
var engineDefault = 'pixelsmith';
var algorithmDefault = 'binary-tree';
var SPEC_VERSION_RANGE = '>=2.0.0 <3.0.0';

// Define our spritesmith utility
// Gist of params: {src: files, engine: 'pixelsmith', algorithm: 'binary-tree'}
// Gist of result: {image: binary, coordinates: {filepath: {x, y, width, height}}, properties: {width, height}}
function spritesmith(params) {
  // Set up return items and fallback parameters
  var files = params.src;
  var engineName = params.engine || engineDefault;
  var Engine = engineName;
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
      Engine = require(engineName);
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

  // Verify we are on a matching `specVersion`
  if (!semver.satisfies(Engine.specVersion, SPEC_VERSION_RANGE)) {
    throw new Error('Expected `engine` to have `specVersion` within "' + SPEC_VERSION_RANGE + '" ' +
      'but it was "' + Engine.specVersion + '". Please verify you are on the latest version of your engine: ' +
      '`npm install my-engine@latest`');
  }

  // Create our engine and layout
  var engine = new Engine(params.engineOpts || {});
  var layer = new Layout(algorithmName, params.algorithmOpts);
  var padding = params.padding || 0;
  var exportOpts = params.exportOpts || {};
  var packedObj;

  // Generate streams for returning
  var infoStream = through2.obj();
  var imgStream = through2();
  var infoObj = {};

  // In a waterfall fashion
  async.waterfall([
    function grabImages (cb) {
      // Map the files into their image counterparts
      engine.createImages(files, cb);
    },
    function saveImagePaths (images, cb) {
      // Iterate over the images and save their paths
      images.forEach(function saveImagePath (img, i) {
        // DEV: We don't use `Vinyl.isVinyl` since that was introduced in Sep 2015
        //   We want some backwards compatibility with older setups
        var file = files[i];
        img._filepath = typeof file === 'object' ? file.path : file;
      });

      // Callback with the images
      cb(null, images);
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
      infoObj.coordinates = coordinates;

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
      infoObj.properties = {
        width: width,
        height: height
      };

      // Emit our info
      infoStream.push(infoObj);
      infoStream.push(null);

      // If there are items, generate the canvas
      if (itemsExist) {
        var canvas = engine.createCanvas(width, height);
        process.nextTick(function handleNextTick () {
          cb(null, canvas);
        });
      // Otherwise, skip over potential errors/CPU
      } else {
        cb(null, null);
      }
    },
    // Then, export the canvas
    function exportCanvas (canvas, cb) {
      // If there is no canvas, callback with an empty string
      var items = packedObj.items;
      if (!canvas) {
        imgStream.push(null);
        return;
      }

      // Add the images onto canvas
      try {
        items.forEach(function addImage (item) {
          var img = item.meta.img;
          canvas.addImage(img, item.x, item.y);
        });
      } catch (err) {
        return cb(err);
      }

      // Export our canvas
      var exportStream = canvas['export'](exportOpts);
      exportStream.on('error', function forwardError (err) {
        imgStream.emit('error', err);
      });
      exportStream.pipe(imgStream);
    }
  ], function handleError (err) {
    // If there was an error, emit it on the image stream
    // DEV: We use `imgStream` since it's not yet closed
    // TODO: Make this more granular (e.g. during createImages vs processImages, should be different)
    if (err) {
      imgStream.emit('error', err);
    }
  });

  // Return our streams
  return {
    info: infoStream,
    img: imgStream
  };
}

// Export spritesmith
module.exports = spritesmith;
