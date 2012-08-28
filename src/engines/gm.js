var fs = require('fs'),
    async = require('async'),
    assert = require('assert'),
    gm = require('gm'),
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
  var canvas = gm('').page(width, height);
  this.canvas = canvas;
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
      // Save the size to the image
      img.height = size.height;
      img.width = size.width;

      // Callback
      cb(null);
    }
  ], function (err) {
    // If there was an error, callback with it
    if (err) {
      cb(err);
    } else {
    // Otherwise, callback with the image
      cb(null ,img);
    }
  });
}
Canvas.createImage = createImage;

// Expose the exporters
Canvas.exporters = exporters;

// Export the canvas
module.exports = Canvas;