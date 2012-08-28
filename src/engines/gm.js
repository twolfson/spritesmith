var fs = require('fs'),
    async = require('async'),
    assert = require('assert'),
    gm = require('gm'),
    exporters = {
      'png': function canvasPngExporter (cb) {
        var canvas = this.canvas;
        canvas.stream(function (err, stdout, stderr) {
          // If there was an error, callback with it
          if (err) {
            return cb(err);
          }

          // Otherwise, create placeholder items
          var imgData = [],
              err;

          // On data, add it to imgData
          // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
          stdout.on('data', function (chunk) {
            var binaryStr = chunk.toString('binary');
            imgData.push(binaryStr);
          });

          // On error, save it
          stderr.on('data', function (_err) {
            err = _err;
          });

          // When complete
          stdout.on('end', function () {
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
        });
      }
    };

function Canvas(width, height) {
  // TODO: Get it working without transparent.png (i.e. use the next line)
  // var canvas = gm(525, 110, "#00ff55aa");
  // TODO: Use path
  // var canvas = gm(__dirname + '/transparent.png').extent(width, height);
  var canvas = gm(__dirname + '/../../src-test/actual_files/sprite_base.png');
  this.canvas = canvas;
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
console.log(img.file);
    var canvas = this.canvas;
    canvas.page(img.width, img.height, img.file);
    // canvas.page(x, y, img.file);
  },
  'export': function exportFn (format, cb) {
    // Grab the exporter
    var exporter = exporters[format];
this.canvas.flatten();
    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s canvas engine');
console.log(this.canvas);

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
Canvas.createImage = createImage;

// Expose the exporters
Canvas.exporters = exporters;

// Export the canvas
module.exports = Canvas;