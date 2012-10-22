// TODO: Move over to path
var smith = require('../src/smith.js'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    // sprites = [__dirname + '/test_sprites/sprite1.png'],
    spriteDir = path.join(__dirname, 'test_sprites'),
    sprites = [
      path.join(spriteDir, 'sprite1.png'),
      path.join(spriteDir, 'sprite2.jpg'),
      path.join(spriteDir, 'sprite3.png')
    ];

// Attempt to smith out the sprites
// smith({'src': sprites, 'algorithm': 'reverse-diagonal'}, function (err, result) {
smith({'src': sprites}, function (err, result) {
  if (err) {
    throw err;
  } else {
    var expectedDir = __dirname + '/expected_files';
    // DEV: Write out the result to a file
    // fs.writeFileSync(expectedDir + '/gm.png', result.image, 'binary');

    // DEV: Write out to actual_files
    if (false) {
      try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
      fs.writeFileSync(__dirname + '/actual_files/sprite.png', result.image, 'binary');
      fs.writeFileSync(__dirname + '/actual_files/coordinates.json', JSON.stringify(result.coordinates, null, 4));
    }

    // Assert the actual image is the same expected
    var actualImage = result.image,
        expectedCanvasFile = path.join(expectedDir, 'canvas.png'),
        expectedGmFile = path.join(expectedDir, 'gm.png'),
        expectedCanvasImage = fs.readFileSync(expectedCanvasFile, 'binary'),
        expectedGmImage = fs.readFileSync(expectedGmFile, 'binary'),
        matchesCanvas = expectedCanvasImage === actualImage,
        matchesGm = expectedGmImage === actualImage,
        matchesAnImage = matchesCanvas || matchesGm;
    assert(matchesAnImage, "Actual image does not match expected image");

    // Load in the coordinates
    var expectedCoords = require(expectedDir + '/coordinates.json');

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

    // Notify that the test is passing
    console.log("Success!");
  }
});