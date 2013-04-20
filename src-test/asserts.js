function assertSpritesheet() {
  var result = this.result,
      namespace = this.namespace;

  // DEV: Write out the result to a file
  // fs.writeFileSync(expectedDir + '/gm.png', result.image, 'binary');

  // DEV: Write out to actual_files
  // if (true) {
  if (false) {
    try { fs.mkdirSync(__dirname + '/actual_files'); } catch (e) {}
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.png', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.jpg', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'sprite.tiff', result.image, 'binary');
    fs.writeFileSync(__dirname + '/actual_files/' + namespace + 'coordinates.json', JSON.stringify(result.coordinates, null, 4));
  }

  // Assert the actual image is the same expected
  var actualImage = result.image,
      expectedCanvasFile = path.join(expectedDir, namespace + 'canvas.png'),
      expectedGmFile = path.join(expectedDir, namespace + 'gm.png'),
      expectedGm2File = path.join(expectedDir, namespace + 'gm2.png'),
      expectedCanvasImage = fs.readFileSync(expectedCanvasFile, 'binary'),
      // expectedGmImage = fs.readFileSync(expectedGmFile, 'binary'),
      expectedGmImage = fs.readFileSync(expectedGmFile, 'binary'),
      expectedGm2Image = fs.readFileSync(expectedGm2File, 'binary'),
      matchesCanvas = expectedCanvasImage === actualImage,
      matchesGm = expectedGmImage === actualImage,
      matchesGm2 = expectedGm2Image === actualImage,
      matchesAnImage = matchesCanvas || matchesGm || matchesGm2;

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

// Export the assertions
module.exports = {
  'assertSpritesheet': assertSpritesheet,
  'assertCoordinates': assertCoordinates
};