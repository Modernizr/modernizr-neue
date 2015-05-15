'use strict';

var Hapi = require('hapi');
var Path = require('path');
var modernizr = require('modernizr');
var basePath = Path.join(__dirname, '..');
var envRoutes = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

var routes = require('./routes').concat(
  require(Path.join(__dirname, 'routes', envRoutes))
);

var server = new Hapi.Server({
  connections: {
    router: {
      stripTrailingSlash: true
    }
  }
});

server.views({
  engines: {
    hbs: require('handlebars')
  },
  path: Path.join(basePath, 'frontend', 'templates'),
  partialsPath: Path.join(basePath, 'frontend', 'templates'),
  helpersPath: Path.join(basePath, 'frontend', 'templates', 'helpers')
});

server.connection({ port: process.env.NODE_PORT || 3000 });

server.route(routes);

// prime the modernizr.options cache so its returns the array right away
modernizr.options();

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
