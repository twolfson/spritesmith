// Load in dependencies
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
  console.log(result.coordinates);
});
