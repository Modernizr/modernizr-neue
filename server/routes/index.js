'use strict';
var generateConfig = require('../util/configFromPost');
var frontendUtils = require('../../frontend/js/download/util');

// these routes are shared between production and development. Since they _are_
// used in prod, try to keep them as lightweight as possible.
// Note: this is where the bower download service is wired into `/download`
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

      // reply with an actual file (e.g. trigger a save dialog), rather than just the text of a json file
      reply(config).header('Content-disposition', 'attachment; filename=modernizr-config.json');
    }
  }, {
    method: 'POST',
    path: '/download/gruntconfig',
    handler: function(request, reply) {
      var config = generateConfig(request.payload);
      var gruntConfig = frontendUtils.gruntify(config);

      // reply with an actual file (e.g. trigger a save dialog), rather than just the text of a json file
      reply(gruntConfig).header('Content-disposition', 'attachment; filename=grunt config.json');
    }
  }
];
