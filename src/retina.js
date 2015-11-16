// Load in our dependencies
var _ = require('underscore');
var async = require('async');
var spritesmith = require('./smith');

// Define our spritesmith utility
// Gist of params: {src: files, retainSrc: files, engine: 'pixelsmith', algorithm: 'binary-tree'}
// Gist of result: {image: binary, coordinates: {filepath: {x, y, width, height}}, properties: {width, height}, retinaImage, retinaCoordinates, retinaProperties}
function retinaSpritesmith(params, callback) {
  // If we have a different amount of normal and retina images, complain and leave
  var normalFiles = params.src;
  var retinaFiles = params.retinaSrc;
  if (normalFiles.length !== retinaFiles.length) {
    var err = new Error('Retina settings detected but ' + retinaFiles.length + ' retina images were found. ' +
      'We have ' + normalFiles.length + ' normal images and expect these numbers to line up. ' +
      'Please double check `retinaSrc`.');
    err.src = normalFiles;
    err.retinaSrc = retinaFiles;
    throw err;
  }

  // Duplicate parameters into both normal and retina parameters
  var normalParams = params;
  var retinaParams = _.defaults({
    src: retinaFiles,
    padding: (params.padding || 0) * 2
  }, params);

  // Generate both our spritesheets in parallel
  // TODO: Thinking that these should be more intertwined -- we want to assert image sizes before we actually generate a spritesheet
}
