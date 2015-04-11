var configFromPost = function(config) {
  delete config.q;
  config.minify = config.minify === 'minify';
  config.options = [].concat(config.options || []);
  config['feature-detects'] = [].concat(config['feature-detects'] || []);
  return config;
};

module.exports = configFromPost;
