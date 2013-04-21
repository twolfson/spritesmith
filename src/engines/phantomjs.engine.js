var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert'),
    exporters = {},
    engine = {};

function Canvas(params) {
  // Save the options for later
  this.params = params;

  // Create a store for images
  this.images = [];
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
    // Save the image for later
    this.images.push({
      img: img,
      x: x,
      y: y
    });
  },
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
  // Create a new canvas and callback
  var canvas = new Canvas({
        width: width,
        height: height
      });
  cb(null, canvas);
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
  // TODO: Am I required to provide image dimensions? x_x
  // // Create the image
  // var img = gm(file);

  // // In series...
  // async.waterfall([
  //   // Grab the size
  //   function getImgSize (cb) {
  //     img.size(cb);
  //   },
  //   function saveImgSize (size, cb) {
  //     // Create a structure for preserving the height and width of the image
  //     var imgFile = {
  //       'height': size.height,
  //       'width': size.width,
  //       'file': file
  //     };

  //     // Callback with the imgFile
  //     cb(null, imgFile);
  //   }
  // ], cb);
}
engine.createImage = createImage;

// Function to add new exporters
function addExporter(name, exporter) {
  exporters[name] = exporter;
}

// Expose the exporters
engine.exporters = exporters;
engine.addExporter = addExporter;

// Helper to create exporters (could be a class for better abstraction)
function getPhantomjsExporter(ext) {
  /**
   * Generic exporter
   * @param {Object} options Options to export with
   * @param {Number} [options.quality] Quality of the exported item
   * @param {Function} cb Error-first callback to return binary image string to
   */
  return function phantomjsExporterFn (options, cb) {
    var canvas = this.canvas,
        that = this;

    // TODO: Spawn process that takes JSON.stringify(this.images) and returns data/png:base64
    // TODO: Strip out `data/png;base64` and parse remainder into binary

    async.waterfall([
      // Stringify our parameters and call phantomjs
      function writeOutCanvas (cb) {
        var params = that.params;
        params.images = that.images;
        params.options = options;
        spawn('phantomjs ' + __dirname + '/phantomjs/index.js', cb);
      },
      // Read the file back in (in binary)
      function readInCanvas (stdout, stderr, cb) {
        console.log('OUTPUT: ', stdout);
      },
      // // Destroy the file
      // function destroyFile (retVal, cb) {
      //   file.destroy(function () {
      //     cb(null, retVal);
      //   });
      // }
    ], cb);
  };
}

// Generate the png exporter
var phantomjsPngExporter = getPhantomjsExporter('png');
addExporter('png', phantomjsPngExporter);
addExporter('image/png', phantomjsPngExporter);

// TODO: It seems we can export jpg and webp images
// https://developer.mozilla.org/en-US/docs/DOM/HTMLCanvasElement#Methods

// Export the canvas
module.exports = engine;