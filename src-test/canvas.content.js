var smith = require('../src/smith.js'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

// TODO: How practical would it be to have `this` also access the content properties?
// TODO: The reprocussions would require a default value system which means cleaning up
// the batch context as discussed in GitHub issues
/*
'addParam': function (name, val) {
  this.params[name] = val;
},
'when converted from left to right': function () {
  this.addParam('layout', 'left-right');
}
*/

module.exports = {
  'An array of sprites': function () {
    this.sprites = [
      path.join(spriteDir, 'sprite1.png'),
      path.join(spriteDir, 'sprite2.jpg'),
      path.join(spriteDir, 'sprite3.png')
    ];

    // By default, write to the topDown namespace
    this.namespace = 'topDown.';
  },
  'when processed via spritesmith': function (done) {
    var that = this;

    // Attempt to smith out the sprites
    // TODO: These comments are no longer practical
    // smith({'src': sprites, 'algorithm': 'right-left'}, function (err, result) {
    // smith({'src': sprites, 'engine': 'gm', 'exportOpts': {'format': 'jpg', 'quality': 20}}, function (err, result) {
    // TODO: MUST specify `gm` engine

    // Load in params and add on to src
    var params = this.params || {},
        smithParams = _.extend({'src': this.sprites}, params);

    //
    smith(smithParams, function (err, result) {
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
  'renders a top-down spritesheet': assertSpritesheet,
  'has the proper coordinates': assertCoordinates,
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.params = {'algorithm': 'left-right'};
  }, 'when processed via spritesmith'],
  'renders a left-right spritesheet': assertSpritesheet,
  'has the proper coordinates': assertCoordinates,
  'An empty array': function () {
    this.sprites = [];
  },
  'renders an empty spritesheet': function () {
    assert.strictEqual(this.result.image, '');
  },
  'returns an empty coordinate mapping': function () {
    assert.deepEqual(this.result.coordinates, {});
  },
  'A ridiculous amount of sprites': function () {
    // Create and save an array of 500 sprites
    var sprites = [],
        spritePath = path.join(spriteDir, '16.jpg'),
        i = 500;
    while (i--) { sprites.push(spritePath); }
    this.sprites = sprites;
  },
  'does not crash': function () {
    // Would have thrown
  },
  'returns an image': function () {
    assert.notEqual(this.result.image, '');
  }
};