var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    cp = require('child_process'),
    exec = cp.exec,
    spawn = cp.spawn,
    Stream = require('stream'),
    async = require('async'),
    utils = require('../utils'),
    ScratchFile = utils.ScratchFile,
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
  // In series
  async.waterfall([
    // Grab the stats via phantomjs
    function getImgSize (cb) {
      // TODO: Move me back
      // exec('phantomjs ' + __dirname + '/phantomjs/stats.js ' + file, cb);
      cb(null, '{"height": "16px","width": "16px"}', '');
    },
    function saveImgSize (stdout, stderr, cb) {
      // Parse the output
      var dimensions = JSON.parse(stdout);

      // Adjust the dimensions off of `px`
      dimensions.height = +(dimensions.height.replace('px', ''));
      dimensions.width = +(dimensions.width.replace('px', ''));

      // Callback with the dimensions
      cb(null, dimensions);
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

    // TODO: Execute process that takes JSON.stringify(this.images) and returns data/png:base64
    // TODO: Strip out `data/png;base64` and parse remainder into binary

    // Convert over all image paths to url paths
    var images = that.images;
    images.forEach(function getUrlPath (img) {
      img = img.img;
      img._urlpath = path.relative(__dirname + '/phantomjs', img._filepath);
    });

    // Collect our parameters
    var params = that.params;
    params.images = images;
    params.options = options;

    // Write out argument to temporary file -- streams weren't cutting it
    var scratchFile = new ScratchFile('txt'),
        filepath = scratchFile.filepath;
    fs.writeFileSync(filepath, 'a', 'utf8');

    // Create a child process for phantomjs
    var phantomjs = spawn('phantomjs', [__dirname + '/phantomjs/compose.js', filepath]);

    // When there is data, save it
    var retVal = '';
    phantomjs.stdout.on('data', function (buffer) {
      console.log(buffer + '');
      // Interpret the buffer into a string, parse it via base64, and into binary
      var str = buffer.toString(),
          base64Buffer = new Buffer(str, 'base64'),
          binaryStr = base64Buffer.toString('binary');

      // Save the binary chunk
      retVal += binaryStr;
    });

    // When there is an error, concatenate it
    var err = '';
    phantomjs.stderr.on('data', function (buffer) {
      console.log(buffer + '');
      err += buffer;
    });

    // When we are done
    phantomjs.on('close', function () {
      // Destroy the temporary file
      scratchFile.destroy(function () {
        // If there was an error in phantom, callback with it
        if (err) {
          cb(new Error(err));
        }

        // Otherwise, callback with our retVal
        cb(null, retVal);
      });
    });
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