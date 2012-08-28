var fs = require('fs'),
    async = require('async'),
    assert = require('assert'),
    CanvasLib = require('canvas'),
    ImageLib = CanvasLib.Image,
    exporters = {
      'png': function canvasPngExporter (cb) {
        var canvas = this.canvas,
            pngStream = canvas.createPNGStream(),
            imgData = [],
            err;

        // On data, add it to imgData
        // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
        pngStream.on('data', function (chunk) {
          var binaryStr = chunk.toString('binary');
          imgData.push(binaryStr);
        });

        // On error, save it
        pngStream.on('error', function (_err) {
          err = _err;
        });

        // When complete
        pngStream.on('end', function () {
          // If there was an error, callback with it
          if (err) {
            cb(err);
          } else {
          // Otherwise, join together image data, put it into the retObj
            var retStr = imgData.join('');

            // Callback with no error
            cb(null, retStr);
          }
        });
      }
    };

function Canvas(width, height) {
  var canvas = new CanvasLib(width, height),
      ctx = canvas.getContext('2d');
  this.canvas = canvas;
  this.ctx = ctx;
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
    var ctx = this.ctx;
    ctx.drawImage(img, x, y, img.width, img.height);
  },
  'export': function exportFn (format, cb) {
    // Grab the exporter
    var exporter = exporters[format];

    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s canvas engine');

    // Render the item
    exporter.call(this, cb);
  }
};

// Write out Image as a static property of Canvas
function createImage(file, cb) {
  async.waterfall([
    function readImageFile (cb) {
      // Read in the file as a buffer
      fs.readFile(file, cb);
    },
    function createImageFn (imgBuffer, cb) {
      // Create an image object with the proper source file
      var img = new ImageLib();
      img.src = imgBuffer;

      // Callback with the image
      cb(null, img);
    }
  ], cb);
}
Canvas.createImage = createImage;

// Expose the exporters
Canvas.exporters = exporters;

// Export the canvas
module.exports = Canvas;