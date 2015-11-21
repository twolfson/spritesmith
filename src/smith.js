// Load in dependencies
var Layout = require('layout');
var semver = require('semver');
var through2 = require('through2');

// Specify defaults
var engineDefault = 'pixelsmith';
var algorithmDefault = 'binary-tree';
var SPEC_VERSION_RANGE = '>=2.0.0 <3.0.0';

// Define our spritesmith constructor
function Spritesmith(params) {
  // Process our parameters
  var engineName = params.engine || engineDefault;
  var Engine = engineName;

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

  // Create and save our engine for later
  this.engine = new Engine(params.engineOpts || {});
}
Spritesmith.generateStreams = function () {
  return {
    info: through2.obj(),
    img: through2()
  };
};
// Gist of params: {src: files, engine: 'pixelsmith', algorithm: 'binary-tree'}
// Gist of result:
//    img: Stream(binary)
//    info: Stream({coordinates: {filepath: {x, y, width, height}}, properties: {width, height}})
Spritesmith.run = function (params) {
  // Create a new spritesmith with our parameters
  var spritesmith = new Spritesmith(params);

  // Generate streams for returning
  var retObj = Spritesmith.generateStreams();

  // In an async fashion, create our images
  spritesmith.createImages(params.src, function handleImages (err, images) {
    // If there was an error, emit it on the imgStream
    if (err) {
      retObj.img.emit('error', err);
      return;
    }

    // Otherwise, process our images and forward errors/data
    var spriteData = spritesmith.processImages(images, params);
    spriteData.info.on('error', function forwardInfoError (err) {
      retObj.info.emit('error', err);
    });
    spriteData.info.pipe(retObj.info);
    spriteData.img.on('error', function forwardImgError (err) {
      retObj.img.emit('error', err);
    });
    spriteData.img.pipe(retObj.img);
  });

  // Return our streams
  return retObj;
};
Spritesmith.prototype = {
  createImages: function (files, callback) {
    // Forward image creation to our engine
    this.engine.createImages(files, function handleImags (err, images) {
      // If there was an error, callback with it
      if (err) {
        return callback(err);
      }

      // Otherwise, iterate over the images and save their paths (required for coordinates)
      images.forEach(function saveImagePath (img, i) {
        // DEV: We don't use `Vinyl.isVinyl` since that was introduced in Sep 2015
        //   We want some backwards compatibility with older setups
        var file = files[i];
        img._filepath = typeof file === 'object' ? file.path : file;
      });

      // Callback with our images
      callback(null, images);
    });
  },
  processImages: function (images, options) {
    // Set up our algorithm/layout placement and export configuration
    var algorithmName = options.algorithm || algorithmDefault;
    var layer = new Layout(algorithmName, options.algorithmOpts);
    var padding = options.padding || 0;
    var exportOpts = options.exportOpts || {};
    var packedObj;

    // Generate streams for returning
    var infoStream = through2.obj();
    var imgStream = through2();
    var infoObj = {};

    // After we return the streams
    var that = this;
    process.nextTick(function handleNextTick () {
      // Add our images to our canvas (dry run)
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

      // Then, output the coordinates
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

      // Then, generate a canvas
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

      // If there are no items, return with an empty stream
      var canvas;
      if (!itemsExist) {
        imgStream.push(null);
        return;
      // Otherwise, generate and export our canvas
      } else {
        // Crete our canvas
        canvas = that.engine.createCanvas(width, height);

        // Add the images onto canvas
        try {
          packedObj.items.forEach(function addImage (item) {
            var img = item.meta.img;
            canvas.addImage(img, item.x, item.y);
          });
        } catch (err) {
          imgStream.emit('error', err);
          return;
        }

        // Export our canvas
        var exportStream = canvas['export'](exportOpts);
        exportStream.on('error', function forwardError (err) {
          imgStream.emit('error', err);
        });
        exportStream.pipe(imgStream);
      }
    });

    // Return our streams
    return {
      info: infoStream,
      img: imgStream
    };
  }
};

// Export Spritesmith
module.exports = Spritesmith;
