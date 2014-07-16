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
  }, {
    'when told not to sort': [
      'renders an unsorted spritesheet',
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

// Export the outlines
module.exports = outlines;
