// TODO: Move over to path
var smith = require('../src/smith.js'),
    // sprites = [__dirname + '/test_sprites/sprite1.png'],
    spriteDir = __dirname + '/test_sprites',
    sprites = [spriteDir + '/sprite1.png', spriteDir + '/sprite2.jpg', spriteDir + '/sprite3.png'],
    fs = require('fs'),
    assert = require('assert');

// Attempt to smith out the sprites
smith(sprites, function (err, result) {
  if (err) {
    throw err;
  } else {
    var expectedDir = __dirname + '/expected_files';
    // DEV: Write out the result to a file
    // fs.writeFileSync(__dirname + '/test_sprites/expected.png', result.image, 'binary');

    // Assert the actual image is the same expected
    var expectedFile = expectedDir + '/sprite.png',
        expectedImage = fs.readFileSync(expectedFile, 'binary');
    assert.strictEqual(expectedImage, result.image, "Actual image does not match expected image");

    // Load in the coordinates
    var expectedCoords = require(expectedDir + '/coordinates.json');

    // Normalize the actual coordinates
    // TODO: Normalize dir should be an option
    var actualCoords = result.coordinates,
        normCoords = {},
        path = require('path');
    assert(actualCoords, "Result does not have a coordinates property");

    Object.getOwnPropertyNames(actualCoords).forEach(function (filepath) {
      var file = path.relative(spriteDir, filepath);
      normCoords[file] = actualCoords[filepath];
    });

    // Assert that the returned coordinates deep equal those in the coordinates.json
    assert.deepEqual(expectedCoords, normCoords, "Actual coordinates do not match expected coordinates");

    // Notify that the test is passing
    console.log("Success!");
  }
});