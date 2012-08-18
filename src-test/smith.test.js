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
// var out = fs.createWriteStream(__dirname + '/test_sprites/expected.png');
// var out = fs.createWriteStream(__dirname + '/test_sprites/expected.png', {encoding: 'utf8'});
// var out = fs.createWriteStream(__dirname + '/test_sprites/actual.png', {encoding: 'utf8'});
// console.log(out);
var retData = "";
result.on('data', function (chunk) {
  // console.log(Object.keys(chunk.__proto__));
  // console.log(chunk[0]);
  // console.log(chunk.toString('utf8'));
  // out.write(chunk);
  // utf8', 'utf16le' ('ucs2'), 'ascii', or 'hex'. Defaults to 'utf8'.
  retData += chunk.toString('binary');
});
result.on('end', function () {
  // console.log('3');
  // out.end(function (err) {

  var newData = fs.readFileSync(__dirname + '/test_sprites/expected.png', 'binary');
  // console.log('z', newData);
  // console.log('x', retData);
  console.log(retData === newData);
  // });
  // out.write(retData);
  fs.writeFileSync(__dirname + '/test_sprites/actual.png', retData, 'binary');
});
  }
});