// Generate basic outlines
var outlines = [{
  'An array of sprites': [{
    'when processed via spritesmith': [
      'renders a top-down spritesheet',
      'has the proper coordinates',
      'has the proper properties'
    ]
  }, {
    'when converted from left to right': [
      'renders a left-right spritesheet',
      'has the proper coordinates',
      'has the proper properties'
    ]
  }, {
    'when provided with a padding parameter': [
      'renders a padded spritesheet',
      'has the proper coordinates',
      'has the proper properties'
    ]
  }]
}, {
  'An empty array': [{
    'when processed via spritesmith': [
      'renders an empty spritesheet',
      'returns an empty coordinate mapping',
      'has the proper properties'
    ]
  }]
}];

function addEngineTest(engine) {
  // Attempt to load the engine
  try {
    require(engine);
  } catch (e) {}

  // Create an engine-specific test
  var outline = {};
  outline[engine] = [{
    'when processed via spritesmith': [
      'returns an image'
    ]
  }];

  // Add it to our list
  outlines.push(outline);
}

// Test specific engines
addEngineTest('phantomjssmith');
addEngineTest('gmsmith');
addEngineTest('canvassmith');

// Export the outlines
module.exports = outlines;
