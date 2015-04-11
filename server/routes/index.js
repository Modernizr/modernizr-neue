'use strict';
var generateConfig = require('../util/configFromPost');
var frontendUtils = require('../../frontend/js/download/util');


module.exports = [{
    method: 'GET',
    path: '/download',
    handler: require('../util/determineDownload')
  }, {
    method: 'POST',
    path: '/download',
    handler: require('../util/buildFromPostedQuery')
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
