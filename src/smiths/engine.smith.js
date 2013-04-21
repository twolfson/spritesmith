var async = require('async');
function EngineSmith(engine) {
  this.engine = engine;
}

// ANTI-PATTERN: 2 parameters are non-extensible objects
function saveImagePath(img, file) {
  img._filepath = file;
}

EngineSmith.prototype = {
  // Create an image from a file via the engine
  'createImage': function (file, cb) {
    var engine = this.engine;
    async.waterfall([
      function createImage (cb) {
        engine.createImage(file, cb);
      },
      function savePath (img, cb) {
        // Save the buffer path to the image
        saveImagePath(img, file);

        // Callback with the image
        cb(null, img);
      }
    ], cb);
  },
  // Sugar function for creating multiple images
  'createImages': function (files, cb) {
    // If there is a engine.createImages method, use it
    var engine = this.engine;
    if (engine.createImages) {
      async.waterfall([
        // Mass create images
        function engineCreateImages (cb) {
          engine.createImages(files, cb);
        },
        // Save the image paths
        function savePaths (imgs, cb) {
          // Iterate over the images and save their paths
          imgs.forEach(function (img, i) {
            saveImagePath(img, files[i]);
          });

          // Callback with the images
          cb(null, imgs);
        }
      ], cb);
    } else {
    // Otherwise, map each of the images individually
      // Map the files into their image counterparts
      // DEV: Magic number of 10 to prevent file descriptor overuse
      // This does not affect perf -- 12 seconds with 300, 11.5 with 10 for 2000 images (derp)
      async.mapLimit(files, 10, this.createImage.bind(this), cb);
    }
  },
  // Helper to create canvas via engine
  'createCanvas': function (width, height, cb) {
    var engine = this.engine;
    return engine.createCanvas(width, height, cb);
  }
};

// Export EngineSmith
module.exports = EngineSmith;