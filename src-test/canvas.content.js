// Load in underscore and common test
var _ = require('underscore'),
    common = require('./smith.content');

module.exports = _.defaults({
  'using canvas engine': function () {
    // Localize and fallback options
    var options = this.options || {};

    // Add `canvas` as engine
    options.engine = 'canvas';

    // Save reference
    this.options = options;
  },
  'An array of sprites': ['_An array of sprites', 'using canvas engine'],
  'when converted from left to right': ['_when converted from left to right', 'using canvas engine'],
  'An empty array': ['_An empty array', 'using canvas engine'],
  'A ridiculous amount of sprites': ['_A ridiculous amount of sprites', 'using canvas engine']
}, common);