'use strict';
var Modernizr = require('modernizr');
var frontendUtils = require('../frontend/js/download/util');

var generateConfig = function(config) {
  delete config.q;
  config.minify = config.minify === 'minify';
  config.options = [].concat(config.options || []);
  config['feature-detects'] = [].concat(config['feature-detects'] || []);
  return config;
};

var buildFromQuery = function(request, reply) {
  var config = generateConfig(request.payload || request.url.search.replace('^?', ''));
  config.minify = true;
  var ext = config.minify ? '.min.js' : '.js';

  Modernizr.build(config, function(build) {
    reply(build).header('Content-disposition', 'attachment; filename=modernizr-custom' + ext);
  });
};


module.exports = [{
    method: 'POST',
    path: '/download',
    handler: buildFromQuery
  }, {
    method: 'POST',
    path: '/download/config',
    handler: function(request, reply) {
      var config = generateConfig(request.payload);
      reply(config).header('Content-disposition', 'attachment; filename=modernizr-config.json');
    }
  }, {
    method: 'POST',
    path: '/download/gruntconfig',
    handler: function(request, reply) {
      var config = generateConfig(request.payload);
      var gruntConfig = frontendUtils.gruntify(config);
      reply(gruntConfig).header('Content-disposition', 'attachment; filename=grunt config.json');
    }
  }
];
