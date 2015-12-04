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

var preResponse = function(request, reply) {
  // set the default caching to 6 hours
  var response = request.response;

  if (response.isBoom) {
    return reply();
  }

  request.response.settings.ttl = 6 * 60 * 60 * 1000;

  reply.continue();
};


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

server.ext('onPreResponse', preResponse);

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
