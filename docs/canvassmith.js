// In our script
// Load in dependencies
var fs = require('fs');
var spritesmith = require('../');

// Generate our spritesheet
spritesmith({
  src: [
    __dirname + '/fork.png',
    __dirname + '/github.png',
    __dirname + '/twitter.png'
  ],
  engine: require('canvassmith')
}, function handleResult (err, result) {
  // If there was an error, throw it
  if (err) {
    throw err;
  }

  // Output the image
  fs.writeFileSync(__dirname + '/canvassmith.png', result.image, 'binary');
  result.coordinates, result.properties; // Coordinates and properties
});
