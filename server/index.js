'use strict';

var Hapi = require('hapi');
var Path = require('path');
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
  var response = request.response;

  if (response.isBoom) {
    return reply();
  }

  // cache for 6 hours
  request.response.headers['cache-control'] = 'max-age=21600, public';

  // help prevent xss
  request.response.headers['x-xss-protection'] = '1; mode=block';

  // stops browsers from trying to sniff the content type and forces it to stick with the declared content-type
  request.response.headers['x-content-type-options'] = 'nosniff';

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
