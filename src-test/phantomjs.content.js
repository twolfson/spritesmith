// Load in underscore and common test
var _ = require('underscore'),
    common = require('./smith.content');

module.exports = _.defaults({
  'using phantomjs engine': function () {
    // Localize and fallback options
    var options = this.options || {};

    // Add `phantomjs` as engine
    options.engine = 'phantomjs';

    // Save reference
    this.options = options;
  },
  'when processed via spritesmith': ['using phantomjs engine', '_when processed via spritesmith'],
  'when converted from left to right': [function () {
    this.namespace = 'leftRight.';
    this.options = {'algorithm': 'left-right'};
  }, 'using phantomjs engine', '_when processed via spritesmith']
}, common);