var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert'),
    utils = require('../utils'),
    ScratchFile = utils.ScratchFile,
    gm = require('gm'),
    exporters = {},
    engine = {};

function Canvas() {
  var canvas = gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the canvas
  this.canvas = canvas;
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
    // Add the image
    var canvas = this.canvas;

    // TODO: Pull request this in to gm
    canvas.out('-page');
    canvas.out('+' + x + '+' + y);
    canvas.out(img.file);
  },
  'export': function exportFn (options, cb) {
    // Grab the exporter
    var that = this,
        canvas = that.canvas,
        format = options.format || 'png',
        exporter = exporters[format];

    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s gm engine');

    async.waterfall([
      function outputImage (cb) {
        // Flatten the image (with transparency)
        canvas.mosaic();

        // Render the item
        exporter.call(that, cb);
      }
    ], cb);
  }
};

// Expose Canvas to engine
engine.Canvas = Canvas;

// Create paths for the scratch directory and transparent pixel
function createCanvas(width, height, cb) {
  // Generate a scratch file
  var scratchFile = new ScratchFile('png'),
      filepath = scratchFile.filepath;
  async.waterfall([
    function generateCanvas (cb) {
      // Generate a transparent canvas
      var base = gm(width, height, 'transparent');

      // Write out the base file
      base.write(filepath, cb);
    },
    // TODO: Move over to async.series
    function destroyScratchFile () {
      var cb = arguments[arguments.length - 1];

      // Ignore destory errors
      scratchFile.destroy(function () {
        cb(null);
      });
    },
    function loadBackCanvas (cb) {
      // Create a canvas
      var canvas = new Canvas();

      // Callback with it
      cb(null, canvas);
    }
  ], cb);
}

// Expose createCanvas to engine
engine.createCanvas = createCanvas;

// Write out Image as a static property of Canvas
/**
 * @param {String} file File path to load in
 * @param {Function} callback Error first callback to retrun the image from
 * @prop {Number} image.width
 * @prop {Number} image.height
 * @note Must be guaranteed to integrate into own library via .addImage
 */
function createImage(file, cb) {
  // Create the image
  var img = gm(file);

  // In series...
  async.waterfall([
    // Grab the size
    function getImgSize (cb) {
      img.size(cb);
    },
    function saveImgSize (size, cb) {
      // Create a structure for preserving the height and width of the image
      var imgFile = {
        'height': size.height,
        'width': size.width,
        'file': file
      };

      // Callback with the imgFile
      cb(null, imgFile);
    }
  ], cb);
}
engine.createImage = createImage;

// Function to add new exporters
function addExporter(name, exporter) {
  exporters[name] = exporter;
}

// Expose the exporters
engine.exporters = exporters;
engine.addExporter = addExporter;

// TODO: Allow options
function gmPngExporter(cb) {
  var canvas = this.canvas,
      file = new ScratchFile('png'),
      filepath = file.filepath;

  // Write out to file (how meta)
  canvas.write(filepath, function (err) {
    // If there was an error, callback with it
    if (err) {
      return cb(err);
    }

    // Read the file back in (in binary)
    fs.readFile(filepath, 'binary', function (err, retVal) {
      // Destroy the file
      file.destroy(function () {
        cb(err, retVal);
      });
    });
  });
}
addExporter('png', gmPngExporter);
addExporter('image/png', gmPngExporter);


// Export the canvas
module.exports = engine;