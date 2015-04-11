'use strict';
var etag = require('etag');
var archiver = require('archiver');
var Modernizr = require('modernizr');
var bowerJSON = require('./bowerJSON')();
var modernizrOptions = Modernizr.options();
var modernizrMetadata = Modernizr.metadata();
var _ = require('../../frontend/js/lodash.custom.js');

modernizrOptions = modernizrOptions.concat({
  name: 'minify',
  property: 'minify',
  group: 'minify',
  selected: true
});

if (process.env.NODE_ENV !== 'production') {
  var builderContent = require('../buildSteps/download');
  var team = require('./footer');

  var downloaderConfig = {
    metadata: JSON.stringify(modernizrMetadata),
    options: JSON.stringify(modernizrOptions),
    builderContent: builderContent,
    scripts: [
      '/js/lodash.custom.js',
      '/js/modernizr.custom.js',
      '/lib/zeroclipboard/dist/ZeroClipboard.js',
      '/lib/r.js/dist/r.js',
      '/lib/modernizr/lib/build.js',
      '/js/download/downloader.js',
    ],
    team: team
  };
}

var config = function(query) {

  var config = {
    'minify': true,
    'feature-detects': [],
    'options': []
  };

  var queries = _.chain(query.replace(/^\?/, '').split('&'))
    .map(function(query) {
      return query.split('-');
    })
    .flatten()
    .value();

  queries.forEach(function(query) {
    var searchResult = query.match(/q=(.*)/);

    if (searchResult) {
      return;
    }

    var matches = function(obj) {
      var prop = obj.property;

      if (_.isArray(prop)) {
        prop = prop.join('_');
      }

      if (query === prop.toLowerCase()) {
        return true;
      }

      if (query === 'dontmin' && prop === 'minify') {
        return true;
      }
    };

    if (_.some(modernizrOptions, matches)) {
      config.options.push(query);
    } else if (_.some(modernizrMetadata, matches)) {
      config['feature-detects'].push(query);
    }
  });

  return config;
};

var handler = function (request, reply) {
  var ua = request.headers['user-agent'];
  var isBower = !!ua.match(/node\/v\d*\.\d*\.\d* (darwin|freebsd|linux|sunos|win32) (arm|ia32|x64)/);

  if (isBower) {
    var archive = archiver('tar');
    var buildConfig = config(request.url.search);

    Modernizr.build(buildConfig, function(build) {
      var module = archive
        .append(build, {name: bowerJSON.main})
        .append(JSON.stringify(bowerJSON, 0, 2), {name: 'bower.json'})
        .finalize();

      reply(module)
        .header('Content-disposition', 'attachment; filename=Modernizr.custom.tar')
        .etag(etag(bowerJSON.version + buildConfig));
    });

  } else if (process.env.NODE_ENV !== 'production') {
    // serve the download page
    reply.view('pages/download', downloaderConfig);
  } else {
    reply.file('../../dist/download/index.html');
  }
};

module.exports = handler;
