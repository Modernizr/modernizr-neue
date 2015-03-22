'use strict';
var Path = require('path');
var Modernizr = require('modernizr');
var modernizrMetadata = Modernizr.metadata();
var modernizrOptions = Modernizr.options();
var builderContent = require('./builderBuild.js');

var downloaderConfig = {
  metadata: JSON.stringify(modernizrMetadata),
  options: JSON.stringify(modernizrOptions),
  builderContent: builderContent,
  scripts: [
    '/lib/lodash/lodash.js',
    '/js/modernizr.custom.js',
    '/lib/zeroclipboard/dist/ZeroClipboard.js',
    '/lib/r.js/dist/r.js',
    '/lib/modernizr/lib/build.js',
    '/js/download/downloader.js',
  ]
};


module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply.view('index');
    }
  }, {
    method: 'GET',
    path: '/download',
    handler: function(request, reply) {

      reply.view('pages/download', downloaderConfig);
    }
  }, {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '..', 'frontend')
      }
    }
  }, {
    method: 'GET',
    path: '/i/js/metadata.json',
    handler: function(request, reply) {
      reply(modernizrMetadata);
    }
  }, {
    method: 'GET',
    path: '/i/js/modernizr-git/package.json',
    handler: function(request, reply) {
      var pkg = Path.join(__dirname, '..', 'frontend', 'lib', 'modernizr', 'package.json');
      reply.file(pkg);
    }
  }, {
    method: 'GET',
    path: '/i/js/modernizr-git/{path*}',
    handler: function(request, reply) {
      var base = [__dirname, '..', 'frontend', 'lib', 'modernizr'];
      var requestedFile = request.params.path.split('/');
      var file = Path.join.apply(Path, base.concat(requestedFile));

      reply.file(file);
    }
  }
];
