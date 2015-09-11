'use strict';
var listify = function(string) {
  return _.reduce(string, function(str, next, i, arr) {
    var joiner = i + 1 < arr.length ? ', ' : ' and ';
    return str + joiner + next;
  });
};

var pluralize = function(baseStr, arr) {
  var length = arr.length;
  return baseStr + ((length > 1 || length === 0) ? 's': '');
};

var gruntify = function(config) {
  var gruntConfig = {
    parseFiles: true,
    customTests: [],
    devFile: '/PATH/TO/modernizr-dev.js',
    outputFile: '/PATH/TO/modernizr-output.js'
  };
  gruntConfig.tests = _.map(config['feature-detects'], function(test) {
      return test.replace(/^test\//, '');
    });
  gruntConfig.extensibility = config.options;
  gruntConfig.uglify = config.minify;
  return JSON.stringify(gruntConfig, 0, 2);
};

module.exports = {
  listify: listify,
  gruntify: gruntify,
  pluralize: pluralize
};
