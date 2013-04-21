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
  'when processed via spritesmith': ['using canvas engine', '_when processed via spritesmith'],
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.options = {'algorithm': 'left-right'};
  }, 'using canvas engine', '_when processed via spritesmith']
}, common);