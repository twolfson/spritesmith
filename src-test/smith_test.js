// Load in modules and set up routes
var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    smith = require('../src/smith.js'),
    spriteDir = path.join(__dirname, 'test_sprites'),
    expectedDir = __dirname + '/expected_files';

function processViaSpritesmith() {
  before(function processViaSpritesmithFn (done) {
    var that = this;

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
  });
}

function assertSpritesheet() {
  var result = this.result,
      namespace = this.namespace;

  // DEV: Write out to actual_files
  if (process.env.TEST_DEBUG) {
    try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.png', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.jpg', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.tiff', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'coordinates.json', JSON.stringify(result.coordinates, null, 4));
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'properties.json', JSON.stringify(result.properties, null, 4));
  }

  // Assert the actual image is the same expected
  var actualImage = result.image,
      expectedFilenames = ['canvas.png', 'gm.png', 'gm2.png', 'phantomjs.png', 'phantomjs2.png'],
      matchesAnImage = false;

  // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
  expectedFilenames.forEach(function testAgainstExpected (filename) {
    if (!matchesAnImage) {
      var filepath = path.join(expectedDir, namespace + filename);
      if (fs.existsSync(filepath)) {
        var expectedImage = fs.readFileSync(filepath, 'binary');
        matchesAnImage = actualImage === expectedImage;
      }
    }
  });

  assert(matchesAnImage, "Actual image does not match expected image");
}

function assertCoordinates() {
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

function assertProps() {
  // Load in the properties
  var actualProps = this.result.properties,
      expectedProps = require(expectedDir + '/' + this.namespace + 'properties.json');

  // Assert that the returned properties equals the expected properties
  assert.deepEqual(expectedProps, actualProps, "Actual properties do not match expected properties");
}

describe('An array of sprites', function () {
  before(function setupSprites () {
    // DEV: These were unsorted for testing `sort: false` but these work for all tests as is =D
    this.sprites = [
      path.join(spriteDir, 'sprite1.png'),
      path.join(spriteDir, 'sprite3.png'),
      path.join(spriteDir, 'sprite2.jpg')
    ];

    // TODO: Namespace should be define in first item again to make tests randomizable
    // By default, write to the topDown namespace
    this.namespace = 'topDown.';
  });

  describe('when processed via spritesmith', function () {
    processViaSpritesmith();

    it('renders a top-down spritesheet', assertSpritesheet);
    it('has the proper coordinates', assertCoordinates);
    it('has the proper properties', assertProps);
  });

  describe('when converted from left to right', function () {
    before(function adjustToLeftRight () {
      this.namespace = 'leftRight.';
      this.options = {'algorithm': 'left-right'};
    });
    processViaSpritesmith();

    it('renders a left-right spritesheet', assertSpritesheet);
    it('has the proper coordinates', assertCoordinates);
    it('has the proper properties', assertProps);
  });

  describe('when provided with a padding parameter', function () {
    before(function addPaddingParams () {
      this.namespace = 'padding.';
      this.options = {'algorithm': 'binary-tree', 'padding': 2};
    });
    processViaSpritesmith();

    it('renders a padded spritesheet', assertSpritesheet);
    it('has the proper coordinates', assertCoordinates);
    it('has the proper properties', assertProps);
  });

  describe('when told not to sort', function () {
    before(function removeSorting () {
      this.namespace = 'unsorted.';
      this.options = {'algorithm': 'top-down', 'algorithmOpts': {'sort': false}};
    });
    processViaSpritesmith();

    it('renders an unsorted spritesheet', assertSpritesheet);
    it('has the proper coordinates', assertCoordinates);
    it('has the proper properties', assertProps);
  });
});

describe('An empty array', function () {
  before(function setupEmptySprites () {
    this.namespace = 'empty.';
    this.sprites = [];
  });

  describe('when processed via spritesmith', function () {
    it('renders an empty spritesheet', function () {
      assert.strictEqual(this.result.image, '');
    });
    it('returns an empty coordinate mapping', function () {
      assert.deepEqual(this.result.coordinates, {});
    });
    it('has the proper properties', assertProps);
  });
});

function addEngineTest(engine) {
  // Attempt to load the engine
  try {
    require(engine);
  } catch (e) {}

  // Create an engine-specific test
  describe(engine, function () {
    before(function setupSprites () {
      // DEV: These were unsorted for testing `sort: false` but these work for all tests as is =D
      this.sprites = [
        path.join(spriteDir, 'sprite1.png'),
        path.join(spriteDir, 'sprite3.png'),
        path.join(spriteDir, 'sprite2.jpg')
      ];

      // Use engine as namespace (e.g. `phantomjs.`)
      this.namespace = engine + '.';
      this.options = {'engine': engine};
    });

    describe('when processed via spritesmith', function () {
      processViaSpritesmith();

      it('returns an image', function () {
        // DEV: Write out to actual_files
        if (process.env.TEST_DEBUG) {
          try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
          fs.writeFileSync(__dirname + '/actual_files/' + this.namespace + 'sprite.png', this.result.image, 'binary');
        }

        assert.notEqual(this.result.image, '');
      });
    });
  });
}

// Test specific engines
addEngineTest('phantomjssmith');
addEngineTest('gmsmith');
addEngineTest('canvassmith');
