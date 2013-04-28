var async = require('async');
function EngineSmith(engine) {
  this.engine = engine;
}

EngineSmith.prototype = {
  // Create multiple images
  'createImages': function (files, cb) {
    // If there is a engine.createImages method, use it
    var engine = this.engine;
    async.waterfall([
      // Mass create images
      function engineCreateImages (cb) {
        engine.createImages(files, cb);
      },
      // Save the image paths
      function savePaths (imgs, cb) {
        // Iterate over the images and save their paths
        imgs.forEach(function (img, i) {
          img._filepath = files[i];
        });

        // Callback with the images
        cb(null, imgs);
      }
    ], cb);
  },
  // Helper to create canvas via engine
  'createCanvas': function (width, height, cb) {
    var engine = this.engine;
    return engine.createCanvas(width, height, cb);
  }
};

// Export EngineSmith
module.exports = EngineSmith;