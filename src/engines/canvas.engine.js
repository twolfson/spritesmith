var fs = require('fs'),
    async = require('async'),
    assert = require('assert'),
    utils = require('../utils'),
    streamToString = utils.streamToString,
    CanvasLib = require('canvas'),
    ImageLib = CanvasLib.Image,
    exporters = {},
    engine = {};

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
  /**
   * @param {Object} options Options for export
   * @param {String} options.format Format to export as
   * @param {Mixed} options.* Any other options the exporter might have
   * @param {Function}
   */
  'export': function exportFn (options, cb) {
    // Grab the exporter
    var format = options.format || 'png',
        exporter = exporters[format];

    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s canvas engine');

    // Render the item
    exporter.call(this, options, cb);
  }
};

// Expose Canvas to engine
engine.Canvas = Canvas;

function createCanvas(width, height, cb) {
  var canvas = new Canvas(width, height);
  cb(null, canvas);
}

// Expose createCanvas to engine
engine.createCanvas = createCanvas;

// Write out Image as a static property of engine
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
engine.createImage = createImage;

// Function to add new exporters
function addExporter(name, exporter) {
  exporters[name] = exporter;
}

// Expose the exporters
engine.exporters = exporters;
engine.addExporter = addExporter;

// Add the png exporter
function canvasPngExporter(options, cb) {
  var canvas = this.canvas,
      pngStream = canvas.createPNGStream();

  // Stream out the png to a binary string and callback
  streamToString(pngStream, cb);
}
addExporter('png', canvasPngExporter);
addExporter('image/png', canvasPngExporter);

// Add the jpg exporter
function canvasJpegExporter(options, cb) {
  var canvas = this.canvas,
      jpegStream = canvas.createJPEGStream();

  // Stream out the jpeg to a binary string and callback
  streamToString(jpegStream, cb);
}
addExporter('jpg', canvasJpegExporter);
addExporter('jpeg', canvasJpegExporter);
addExporter('image/jpg', canvasJpegExporter);
addExporter('image/jpeg', canvasJpegExporter);

// Export the canvas
module.exports = engine;