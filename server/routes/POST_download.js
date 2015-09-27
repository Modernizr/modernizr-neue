'use strict';
var Modernizr = require('modernizr');
var generateConfig = require('../util/configFromPost');

// in the case of script-less clients, we allow for the form on `/download` to POST
// the configuration used on the page. This is NOT the same as the build hash/querystring
// that is included at the top of every file. It is _only_ used when a client POSTs the form
// on the download page

var buildFromPostedQuery = function(request, reply) {
  var config = generateConfig(request.payload || request.url.search.replace('^?', ''));
  var ext = config.minify ? '.min.js' : '.js';

  Modernizr.build(config, function(build) {
    reply(build)
      .header('Content-Type', 'text/javascript')
      .header('Content-Disposition', 'attachment; filename=modernizr-custom' + ext);
  });
};

module.exports = buildFromPostedQuery;
