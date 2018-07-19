'use strict';
var _ = require('lodash');

var capitalize = function(baseStr) {
  return baseStr.charAt(0).toUpperCase() + baseStr.slice(1);
};

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

var gruntify = function(config, metadata) {
  var gruntConfig = {
    crawl: false,
    customTests: [],
    dest: '/PATH/TO/modernizr-output.js'
  };
  gruntConfig.tests = _.map(config['feature-detects'], function(amdPath) {
    var detect = _.find(metadata, function(detect) {
      return detect.amdPath === amdPath || detect.amdPath === 'test/' + amdPath;
    });

    return detect.property;
  });
  gruntConfig.options = config.options;
  gruntConfig.uglify = config.minify;
  return JSON.stringify(gruntConfig, 0, 2);
};

module.exports = {
  capitalize: capitalize,
  listify: listify,
  gruntify: gruntify,
  pluralize: pluralize
};
