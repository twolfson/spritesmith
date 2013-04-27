// Load in underscore and common test
var _ = require('underscore'),
path = require('path'),

    common = require('./smith.content');

    var assert = require('assert'),
        fs = require('fs'),
        path = require('path'),
        _ = require('underscore'),
        smith = require('../src/smith.js'),
        spriteDir = path.join(__dirname, 'test_sprites'),
        expectedDir = __dirname + '/expected_files';

module.exports = _.defaults({
  'using gm engine': function () {
    // Localize and fallback options
    var options = this.options || {};

    // Add `gm` as engine
    options.engine = 'gm';

    // Save reference
    this.options = options;
  },
  'when processed via spritesmith': ['using gm engine', '_when processed via spritesmith'],
  '_when processed via spritesmith': function (done) {
    var that = this;

    // Load in params and add on to src
    var options = this.options || {},
        params = _.extend({'src': this.sprites}, options);
    this.timeout(20000);

    // Attempt to smith out the sprites
    smith(params, function (err, result) {
      // If there is an error, throw it
      if (err) {
        throw err;
      } else {
      // Otherwise, save the result
        that.result = result;
      }

      // Callback
      done(err);
    });
  },
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.options = {'algorithm': 'left-right'};
  }, 'using gm engine', '_when processed via spritesmith'],
  'A ridiculous amount of sprites': function () {
    // Create and save an array of 500 sprites
    var sprites = [],
        spritePath = path.join(spriteDir, '16.jpg'),
        i = 500;
    while (i--) { sprites.push(spritePath); }
    this.sprites = sprites;
    this.namespace = 'ridiculous.';
    this.timeout(5000);
  }
}, common);