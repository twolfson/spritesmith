var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert'),
    gm = require('gm'),
    exporters = {
      'png': function canvasPngExporter (cb) {
        var canvas = this.canvas,
            file = canvas._file;

        // Write out to file (how meta)
        canvas.write(file, function (err) {
          // If there was an error, callback with it
          if (err) {
            return cb(err);
          }

          // Read the file back in (in binary)
          fs.readFile(file, 'binary', cb);
        });
      }
    },
    engine = {};

function Canvas(file) {
  var canvas = gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the file as a reference
  canvas._file = file;

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
    // Grab the tmpfile and exporter
    var that = this,
        canvas = that.canvas,
        tmpfile = canvas._file,
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
      },
      function cleanupTmpfile (output, cb) {
        // Attempt to delete the tmpfile
        fs.unlink(tmpfile, function (err) {
          // If there is an error, log it
          if (err) {
            console.error('Warning: Could not delete temporary spritesmith file!' + tmpfile, err);
          }

          // Continue with the output
          cb(null, output);
        });
      }
    ], cb);
  }
};

// Expose Canvas to engine
engine.Canvas = Canvas;

// TODO: Make this a spritesmith helper
// Create paths for the scratch directory and transparent pixel
var scratchDir = path.join(__dirname, '../../scratch'),
    transparentPixel = path.join(__dirname, 'transparent.png');
function createCanvas(width, height, cb) {
  var now = +new Date(),
      rand = Math.random(),
      randomFilename = now + '.' + rand + '.png',
      tmpfile = path.join(scratchDir, randomFilename);
  async.waterfall([
    function guaranteeScratchDir (cb) {
      // This always passes due to error annoyances
      fs.mkdir(scratchDir, function () {
        cb(null);
      });
    },
    function generateCanvas (cb) {
      // Generate a transparent canvas
      var base = gm(width, height, 'transparent');

      // Write out the base file
      base.write(tmpfile, cb);
    },
    function loadBackCanvas (x, y, z, cb) {
      // Create a canvas
      var canvas = new Canvas(tmpfile);

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

// Expose the exporters
engine.exporters = exporters;

// Export the canvas
module.exports = engine;