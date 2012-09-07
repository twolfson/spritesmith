var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert'),
    gm = require('gm'),
    exporters = {
      'png': function canvasPngExporter (cb) {
        var canvas = this.canvas;
canvas.write('omnom.png', function () {console.log(arguments);});
        // canvas.stream(function (err, stdout, stderr) {
          // // If there was an error, callback with it
          // if (err) {
            // return cb(err);
          // }

          // // Otherwise, create placeholder items
          // var imgData = [],
              // err;

          // // On data, add it to imgData
          // // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
          // stdout.on('data', function (chunk) {
            // var binaryStr = chunk.toString('binary');
            // imgData.push(binaryStr);
          // });

          // // On error, save it
          // stderr.on('data', function (_err) {
            // err = _err;
          // });

          // // When complete
          // stdout.on('end', function () {
            // // If there was an error, callback with it
            // if (err) {
              // cb(err);
            // } else {
            // // Otherwise, join together image data, put it into the retObj
              // var retStr = imgData.join('');

              // // Callback with no error
              // cb(null, retStr);
            // }
          // });
        // });
      }
    },
    engine = {};

function Canvas(file) {
  var canvas = gm(file);
  canvas.out('-background');
  canvas.out('transparent');
  canvas.out('xc:transparent');
  // var canvas = gm(100, 300, 'transparent');
  this.canvas = canvas;
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
    // Add the image
    var canvas = this.canvas;

    // TODO: Pull request this in
    canvas.out('-page');
// console.log(img.width, img.height, x, y);
    canvas.out(img.width + 'x' + img.height + '+' + x + '+' + y);
    canvas.out(img.file);
  },
  'export': function exportFn (format, cb) {
    // Grab the tmpfile and exporter
    var that = this,
        canvas = that.canvas,
        tmpfile = canvas.source,
        exporter = exporters[format];

    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s canvas engine');

    async.waterfall([
      function outputImage (cb) {
        // Flatten the image (with transparency)
        canvas.mosaic();
        // canvas.flatten();
console.log(canvas);

        // Render the item
        exporter.call(that, cb);
      },
      function cleanupTmpfile (output, cb) {
        // // Attempt to delete the tmpfile
        // fs.unlink(tmpfile, function (err) {
          // // If there is an error, log it
          // if (err) {
            // console.error('Warning: Could not delete temporary spritesmith file!' + tmpfile, err);
          // }

          // Continue with the output
          cb(null, output);
        // });
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
      // tmpfile = path.join(scratchDir, randomFilename);
      tmpfile = path.join(scratchDir, 'test.png');
  async.waterfall([
    function guaranteeScratchDir (cb) {
      // This always passes due to error annoyances
      fs.mkdir(scratchDir, function () {
        cb(null);
      });
    },
    // function generateCanvas (cb) {
      // // TODO: Get it working without transparent.png (i.e. use the next line)
      // // var canvas = gm(525, 110, "#00ff55aa");
      // var base = gm(transparentPixel).extent(width, height);

      // // Write out the base file
      // base.write(tmpfile, cb);
    // },
    // function loadBackCanvas (x, y, z, cb) {
    function loadBackCanvas (cb) {
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