'use strict';
var Modernizr = require('modernizr');
var generateConfig = require('../util/configFromPost');

var buildFromPostedQuery = function(request, reply) {
  var config = generateConfig(request.payload || request.url.search.replace('^?', ''));
  var ext = config.minify ? '.min.js' : '.js';

  Modernizr.build(config, function(build) {
    reply(build).header('Content-disposition', 'attachment; filename=modernizr-custom' + ext);
  });
};

module.exports = buildFromPostedQuery;
