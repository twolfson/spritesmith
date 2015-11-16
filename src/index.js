// Load in our dependencies
var spritesmith = require('./smith');
var retinaSpritesmith = require('./retina');

// Add `retina` as an export attribute of spritesmith
spritesmith.retina = retinaSpritesmith;

// Export spritesmith
module.exports = spritesmith;
