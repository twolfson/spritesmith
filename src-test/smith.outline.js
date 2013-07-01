// Generate basic outlines
var outlines = [{
  "An array of sprites": {
    "when processed via spritesmith": {
      "renders a top-down spritesheet": true,
      "has the proper coordinates": true,
      "has the proper properties": true
    },
    "when converted from left to right": {
      "renders a left-right spritesheet": true,
      "has the proper coordinates": true,
      "has the proper properties": true
    },
    "when provided with a padding parameter": {
      "renders a padded spritesheet": true,
      "has the proper coordinates": true,
      "has the proper properties": true
    }
  }
}, {
  "An empty array": {
    "when processed via spritesmith": {
      "renders an empty spritesheet": true,
      "returns an empty coordinate mapping": true,
      "has the proper properties": true
    }
  }
}];

function addEngineTest(engine) {
  // Attempt to load the engine
  try {
    require(engine);
  } catch (e) {}

  // Create an engine-specific test
  var outline = {};
  outline[engine] = {
    'when processed via spritesmith': {
      'returns an image': true
    }
  };

  // Add it to our list
  outlines.push(outline);
}

// Test specific engines
addEngineTest('phantomjssmith');
addEngineTest('gmsmith');
addEngineTest('canvassmith');

// Export the outlines
module.exports = outlines;
