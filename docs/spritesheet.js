// Load in dependencies
var fs = require('fs');
var spritesmith = require('../');

// Generate our spritesheet
spritesmith({
  src: [
    __dirname + '/fork.png',
    __dirname + '/github.png',
    __dirname + '/twitter.png'
  ]
}, function handleResult (err, result) {
  // If there was an error, throw it
  if (err) {
    throw err;
  }

  // Otherwise, log the JSON
  console.log(JSON.stringify(result.coordinates, null, 2));

  // and output the image
  fs.writeFileSync(__dirname + '/spritesheet.png', result.image, 'binary');
});
