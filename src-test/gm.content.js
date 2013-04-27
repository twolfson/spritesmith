// Load in underscore and common test
var _ = require('underscore'),
    common = require('./smith.content');

module.exports = _.defaults({
  'using gm engine': function () {
    // Localize and fallback options
    var options = this.options || {};

    // Add `gm` as engine
    options.engine = 'gm';

    // Save reference
    this.options = options;
  },
  'when processed via spritesmith': ['using gm engine', '_when processed via spritesmith'],
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.options = {'algorithm': 'left-right'};
  }, 'using gm engine', '_when processed via spritesmith']
}, common);