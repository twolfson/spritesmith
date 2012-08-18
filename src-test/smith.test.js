// TODO: Move over to path
var smith = require('../src/smith.js'),
    sprites = [__dirname + '/test_sprites/sprite1.png'],
    fs = require('fs');

// Attempt to smith out the sprites
smith(sprites, function (err, result) {
  if (err) {
    throw err;
  } else {
    // DEV: Write out the result to a file
    // fs.writeFileSync(__dirname + '/test_sprites/expected.png', result, 'binary');
  }
});