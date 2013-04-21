// Load in modules and set up routes
var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    smith = require('../src/smith.js'),
    spriteDir = path.join(__dirname, 'test_sprites'),
    expectedDir = __dirname + '/expected_files';

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
  'when processed via spritesmith': '_when processed via spritesmith',
  '_when processed via spritesmith': function (done) {
    var that = this;

    // TODO: These comments are no longer practical
    // smith({'src': sprites, 'engine': 'gm'}, function (err, result) {
    // TODO: MUST specify `gm` engine

    // Load in params and add on to src
    var options = this.options || {},
        params = _.extend({'src': this.sprites}, options);

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
  'renders a top-down spritesheet': 'assertSpritesheet',
  'has the proper coordinates': 'assertCoordinates',
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.options = {'algorithm': 'left-right'};
  }, 'when processed via spritesmith'],
  'renders a left-right spritesheet': 'assertSpritesheet',
  'has the proper coordinates': 'assertCoordinates',
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
  },
  assertSpritesheet: function () {
    var result = this.result,
        namespace = this.namespace;

    // DEV: Write out the result to a file
    // fs.writeFileSync(expectedDir + '/gm.png', result.image, 'binary');

    // DEV: Write out to actual_files
    // if (true) {
    if (false) {
      try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.png', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.jpg', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.tiff', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'coordinates.json', JSON.stringify(result.coordinates, null, 4));
    }

    // Assert the actual image is the same expected
    var actualImage = result.image,
        expectedCanvasFile = path.join(expectedDir, namespace + 'canvas.png'),
        expectedGmFile = path.join(expectedDir, namespace + 'gm.png'),
        expectedGm2File = path.join(expectedDir, namespace + 'gm2.png'),
        expectedCanvasImage = fs.readFileSync(expectedCanvasFile, 'binary'),
        // expectedGmImage = fs.readFileSync(expectedGmFile, 'binary'),
        expectedGmImage = fs.readFileSync(expectedGmFile, 'binary'),
        expectedGm2Image = fs.readFileSync(expectedGm2File, 'binary'),
        matchesCanvas = expectedCanvasImage === actualImage,
        matchesGm = expectedGmImage === actualImage,
        matchesGm2 = expectedGm2Image === actualImage,
        matchesAnImage = matchesCanvas || matchesGm || matchesGm2;

    assert(matchesAnImage, "Actual image does not match expected image");
  },
  assertCoordinates: function () {
    // Load in the coordinates
    var result = this.result,
        expectedCoords = require(expectedDir + '/' + this.namespace + 'coordinates.json');

    // Normalize the actual coordinates
    // TODO: Normalize dir should be an option
    var actualCoords = result.coordinates,
        normCoords = {};
    assert(actualCoords, "Result does not have a coordinates property");

    Object.getOwnPropertyNames(actualCoords).forEach(function (filepath) {
      var file = path.relative(spriteDir, filepath);
      normCoords[file] = actualCoords[filepath];
    });

    // Assert that the returned coordinates deep equal those in the coordinates.json
    assert.deepEqual(expectedCoords, normCoords, "Actual coordinates do not match expected coordinates");
  }
};