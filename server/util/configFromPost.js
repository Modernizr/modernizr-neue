'use strict';
// in the case of script-less clients, we allow for the form on `/download` to POST
// the configuration used on the page. This is NOT the same as the build hash/querystring
// that is included at the top of every file. This takes that querystring and converts it
// to a Modernizr configuration object

var configFromPost = function(config) {
  delete config.q;
  config.minify = config.minify === 'minify';
  config.options = [].concat(config.options || []);
  config['feature-detects'] = [].concat(config['feature-detects'] || []);
  return config;
};

module.exports = configFromPost;
