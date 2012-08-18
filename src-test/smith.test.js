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
    // result = fs.readFileSync(__dirname + '/test_sprites/sprite1.png', 'binary');
    // fs.writeFileSync(__dirname + '/test_sprites/expected.png', result, 'binary');
var out = fs.createWriteStream(__dirname + '/test_sprites/expected.png');
// console.log(out);
result.on('data', out.write.bind(out));
result.on('end', function () { console.log('3'); });
  }
});