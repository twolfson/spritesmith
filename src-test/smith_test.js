// Load in modules
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var spritesmith = require('../src/smith.js');

// Set up paths
var spriteDir = path.join(__dirname, 'test_sprites');
var expectedDir = __dirname + '/expected_files';

// DEV: These were unsorted for testing `sort: false` but these work for all tests as is =D
var multipleSprites = [
  path.join(spriteDir, 'sprite1.png'),
  path.join(spriteDir, 'sprite3.png'),
  path.join(spriteDir, 'sprite2.jpg')
];

// Define common utilities
var spritesmithUtils = {
  process: function (params) {
    before(function processViaSpritesmithFn (done) {
      // Require and save namespace for later
      this.namespace = params.namespace;
      assert(this.namespace, '`params.namespace` was not defined for `spritesmithUtils.process`, please define it');

      // Load in params and add on to src
      var options = params.options || {};
      var spritesmithParams = _.extend({src: params.sprites}, options);

      // Attempt to spritesmith out the sprites
      var that = this;
      spritesmith(spritesmithParams, function saveResult (err, result) {
        // Save the result and callback
        that.err = err;
        that.result = result;
        done();
      });
    });
    after(function cleanupResult () {
      delete this.namespace;
      delete this.result;
    });
  },

  assertNoError: function () {
    assert.strictEqual(this.err, null);
  },

  assertCoordinates: function () {
    // Load in the coordinates
    var result = this.result;
    var expectedCoords = require(expectedDir + '/' + this.namespace + '.coordinates.json');

    // Normalize the actual coordinates
    var actualCoords = result.coordinates;
    var normCoords = {};
    assert(actualCoords, 'Result does not have a coordinates property');

    Object.getOwnPropertyNames(actualCoords).forEach(function (filepath) {
      var file = path.relative(spriteDir, filepath);
      normCoords[file] = actualCoords[filepath];
    });

    // Assert that the returned coordinates deep equal those in the coordinates.json
    assert.deepEqual(expectedCoords, normCoords, 'Actual coordinates do not match expected coordinates');
  },

  assertProps: function () {
    // Load in the properties
    var actualProps = this.result.properties;
    var expectedProps = require(expectedDir + '/' + this.namespace + '.properties.json');

    // Assert that the returned properties equals the expected properties
    assert.deepEqual(expectedProps, actualProps, 'Actual properties do not match expected properties');
  },

  assertSpritesheet: function () {
    var result = this.result;
    var namespace = this.namespace;

    // DEV: Write out to actual_files
    if (process.env.TEST_DEBUG) {
      try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + '.sprite.png', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + '.sprite.jpg', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + '.coordinates.json',
        JSON.stringify(result.coordinates, null, 4));
      fs.writeFileSync(__dirname + '/actual_files/' + namespace + '.properties.json',
        JSON.stringify(result.properties, null, 4));
    }

    // Assert the actual image is the same expected
    var actualImage = result.image;
    var expectedFilenames = ['canvas.png', 'gm.png', 'gm2.png', 'phantomjs.png', 'phantomjs2.png'];
    var matchesAnImage = false;

    // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
    expectedFilenames.forEach(function testAgainstExpected (filename) {
      if (!matchesAnImage) {
        var filepath = path.join(expectedDir, namespace + '.' + filename);
        if (fs.existsSync(filepath)) {
          var expectedImage = fs.readFileSync(filepath, 'binary');
          matchesAnImage = actualImage === expectedImage;
        }
      }
    });

    assert(matchesAnImage, 'Actual image does not match expected image');
  }
};

describe('An array of sprites', function () {
  describe('when processed via spritesmith', function () {
    spritesmithUtils.process({
      namespace: 'topDown',
      sprites: multipleSprites
    });

    it('has no errors', spritesmithUtils.assertNoError);
    it('renders a top-down spritesheet', spritesmithUtils.assertSpritesheet);
    it('has the proper coordinates', spritesmithUtils.assertCoordinates);
    it('has the proper properties', spritesmithUtils.assertProps);
  });

  describe('when converted from left to right', function () {
    spritesmithUtils.process({
      namespace: 'leftRight',
      sprites: multipleSprites,
      options: {
        algorithm: 'left-right'
      }
    });

    it('has no errors', spritesmithUtils.assertNoError);
    it('renders a left-right spritesheet', spritesmithUtils.assertSpritesheet);
    it('has the proper coordinates', spritesmithUtils.assertCoordinates);
    it('has the proper properties', spritesmithUtils.assertProps);
  });

  describe('when provided with a padding parameter', function () {
    spritesmithUtils.process({
      namespace: 'padding',
      sprites: multipleSprites,
      options: {
        algorithm: 'binary-tree',
        padding: 2
      }
    });

    it('has no errors', spritesmithUtils.assertNoError);
    it('renders a padded spritesheet', spritesmithUtils.assertSpritesheet);
    it('has the proper coordinates', spritesmithUtils.assertCoordinates);
    it('has the proper properties', spritesmithUtils.assertProps);
  });

  describe('when told not to sort', function () {
    spritesmithUtils.process({
      namespace: 'unsorted',
      sprites: multipleSprites,
      options: {
        algorithm: 'top-down',
        algorithmOpts: {sort: false}
      }
    });

    it('has no errors', spritesmithUtils.assertNoError);
    it('renders an unsorted spritesheet', spritesmithUtils.assertSpritesheet);
    it('has the proper coordinates', spritesmithUtils.assertCoordinates);
    it('has the proper properties', spritesmithUtils.assertProps);
  });
});

describe('An empty array', function () {
  var emptySprites = [];

  describe('when processed via spritesmith', function () {
    spritesmithUtils.process({
      namespace: 'empty',
      sprites: emptySprites
    });

    it('has no errors', spritesmithUtils.assertNoError);
    it('renders an empty spritesheet', function () {
      assert.strictEqual(this.result.image, '');
    });
    it('returns an empty coordinate mapping', function () {
      assert.deepEqual(this.result.coordinates, {});
    });
    it('has the proper properties', spritesmithUtils.assertProps);
  });
});

// Edge cases
// Test for https://github.com/twolfson/gulp.spritesmith/issues/22
var canvassmith;
try {
  canvassmith = require('canvassmith');
} catch (err) {}
var describeIfCanvassmithExists = canvassmith ? describe : describe.skip;
describeIfCanvassmithExists('Spritesmith using canvassmith', function () {
  describe('processing a bad image', function () {
    spritesmithUtils.process({
      namespace: 'canvassmith-error',
      sprites: [path.join(spriteDir, 'malformed.png')],
      options: {
        engine: 'canvassmith'
      }
    });

    it('calls back with an error', function () {
      assert.notEqual(this.err, null);
    });
  });
});
