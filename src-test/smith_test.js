// Load in modules
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var spritesmith = require('../src/smith.js');

// Set up paths
var spriteDir = path.join(__dirname, 'test_sprites');
var expectedDir = __dirname + '/expected_files';
var pixelsmithNS = 'pixelsmith-node-' + process.version;

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
      delete this.err;
      delete this.result;
    });
  },

  assertNoError: function () {
    return function assertNoErrorFn () {
      assert.strictEqual(this.err, null);
    };
  },

  assertCoordinates: function (filename) {
    return function assertCoordinatesFn () {
      // Load in the coordinates
      var result = this.result;
      var expectedCoords = require(expectedDir + '/' + filename);

      // DEV: Write out to actual_files
      if (process.env.TEST_DEBUG) {
        try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
        fs.writeFileSync(__dirname + '/actual_files/' + filename, JSON.stringify(result.coordinates, null, 4));
      }

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
    };
  },

  assertProps: function (filename) {
    return function assertPropsFn () {
      // Load in the properties
      var actualProps = this.result.properties;
      var expectedProps = require(expectedDir + '/' + filename);

      // DEV: Write out to actual_files
      if (process.env.TEST_DEBUG) {
        try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
        fs.writeFileSync(__dirname + '/actual_files/' + filename, JSON.stringify(this.result.properties, null, 4));
      }

      // Assert that the returned properties equals the expected properties
      assert.deepEqual(expectedProps, actualProps, 'Actual properties do not match expected properties');
    };
  },

  assertSpritesheet: function (filename) {
    return function assertSpritesheetFn () {
      var result = this.result;

      // DEV: Write out to actual_files
      if (process.env.TEST_DEBUG) {
        try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
        fs.writeFileSync(__dirname + '/actual_files/' + filename, result.image, 'binary');
      }

      // Assert the actual image is the same expected
      var actualImage = result.image;
      var filepath = path.join(expectedDir, filename);
      var expectedImage = fs.readFileSync(filepath, 'binary');
      assert(actualImage === expectedImage, 'Actual image does not match expected image');
    };
  }
};

// Start our tests
describe('An array of sprites', function () {
  describe('when processed via spritesmith', function () {
    spritesmithUtils.process({
      sprites: multipleSprites
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders a top-down spritesheet', spritesmithUtils.assertSpritesheet('topDown.' + pixelsmithNS + '.png'));
    it('has the proper coordinates', spritesmithUtils.assertCoordinates('topDown.coordinates.json'));
    it('has the proper properties', spritesmithUtils.assertProps('topDown.properties.json'));
  });

  describe('when converted from left to right', function () {
    spritesmithUtils.process({
      sprites: multipleSprites,
      options: {
        algorithm: 'left-right'
      }
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders a left-right spritesheet', spritesmithUtils.assertSpritesheet('leftRight.' + pixelsmithNS + '.png'));
    it('has the proper coordinates', spritesmithUtils.assertCoordinates('leftRight.coordinates.json'));
    it('has the proper properties', spritesmithUtils.assertProps('leftRight.properties.json'));
  });

  describe('when provided with a padding parameter', function () {
    spritesmithUtils.process({
      sprites: multipleSprites,
      options: {
        algorithm: 'binary-tree',
        padding: 2
      }
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders a padded spritesheet', spritesmithUtils.assertSpritesheet('padding.' + pixelsmithNS + '.png'));
    it('has the proper coordinates', spritesmithUtils.assertCoordinates('padding.coordinates.json'));
    it('has the proper properties', spritesmithUtils.assertProps('padding.properties.json'));
  });

  describe('when told not to sort', function () {
    spritesmithUtils.process({
      sprites: multipleSprites,
      options: {
        algorithm: 'top-down',
        algorithmOpts: {sort: false}
      }
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders an unsorted spritesheet', spritesmithUtils.assertSpritesheet('unsorted.' + pixelsmithNS + '.png'));
    it('has the proper coordinates', spritesmithUtils.assertCoordinates('unsorted.coordinates.json'));
    it('has the proper properties', spritesmithUtils.assertProps('unsorted.properties.json'));
  });
});

describe('An empty array', function () {
  var emptySprites = [];

  describe('when processed via spritesmith', function () {
    spritesmithUtils.process({
      sprites: emptySprites
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders an empty spritesheet', function () {
      assert.strictEqual(this.result.image, '');
    });
    it('returns an empty coordinate mapping', function () {
      assert.deepEqual(this.result.coordinates, {});
    });
    it('has the proper properties', spritesmithUtils.assertProps('empty.properties.json'));
  });
});

describe('`spritesmith` using a custom engine via string', function () {
  describe('processing a set of images', function () {
    spritesmithUtils.process({
      sprites: multipleSprites,
      options: {
        engine: 'phantomjssmith'
      }
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders a spritesheet', spritesmithUtils.assertSpritesheet('topDown.phantomjs.png'));
  });
});

describe('`spritesmith` using a custom engine via an object', function () {
  describe('processing a set of images', function () {
    spritesmithUtils.process({
      sprites: multipleSprites,
      options: {
        engine: require('phantomjssmith')
      }
    });

    it('has no errors', spritesmithUtils.assertNoError());
    it('renders a spritesheet', spritesmithUtils.assertSpritesheet('topDown.phantomjs.png'));
  });
});

// Edge cases
// Test for https://github.com/twolfson/gulp.spritesmith/issues/22
var canvassmith;
try {
  canvassmith = require('canvassmith');
} catch (err) {}
var describeIfCanvassmithExists = canvassmith ? describe : describe.skip;
describeIfCanvassmithExists('`spritesmith` using `canvassmith`', function () {
  describe('processing a bad image', function () {
    spritesmithUtils.process({
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
