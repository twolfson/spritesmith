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
    // DEV: Write out the result to a file
    // fs.writeFileSync(__dirname + '/test_sprites/expected.png', result.image, 'binary');

    // Assert the actual image is the same expected
    var expectedFile = spriteDir + '/expected.png',
        expectedImage = fs.readFileSync(expectedFile, 'binary');
    assert.strictEqual(expectedImage, result.image, "Actual image does not match expected image");

    // Notify that the test is passing
    console.log("Success!");
  }
});