var smith = require('../src/smith.js'),
    sprites = [__dirname + '/test_sprites/sprite1.png'];

// Attempt to smith out the sprites
smith(sprites, function (err, result) {
  if (err) {
    throw err;
  } else {
    console.log('RESULT: ', result);
  }
});