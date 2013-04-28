var async = require('async');
function EngineSmith(engine) {
  this.engine = engine;
}

EngineSmith.prototype = {
  // Create multiple images
  'createImages': function (files, cb) {
    // If there is a engine.createImages method, use it
    var engine = this.engine;
    engine.createImages(files, cb);
  },
  // Helper to create canvas via engine
  'createCanvas': function (width, height, cb) {
    var engine = this.engine;
    return engine.createCanvas(width, height, cb);
  }
};

// Export EngineSmith
module.exports = EngineSmith;