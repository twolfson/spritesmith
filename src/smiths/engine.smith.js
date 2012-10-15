var async = require('async');
function EngineSmith(engine) {
  this.engine = engine;
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
        img._filepath = file;

        // Callback with the image
        cb(null, img);
      }
    ], cb);
  },
  // Sugar function for creating multiple images
  'createImages': function (files, cb) {
    // Map the files into their image counterparts
    async.map(files, this.createImage.bind(this), cb);
  },
  // Helper to create canvas via engine
  'createCanvas': function (width, height, cb) {
    var engine = this.engine;
    return engine.createCanvas(width, height, cb);
  }
};

// Export EngineSmith
module.exports = EngineSmith;