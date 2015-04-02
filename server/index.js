'use strict';

var Hapi = require('hapi');
var Path = require('path');
var basePath = Path.join(__dirname, '..');
var envRoutes = process.env.NODE_ENV === 'production' ? 'proudRoutes' : 'devRoutes';

var routes = require('./routes').concat(
  require(Path.join(__dirname, 'routes', envRoutes))
);

var server = new Hapi.Server({
  connections: {
    router: {
      stripTrailingSlash: false
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

server.connection({ port: 3000 });

server.route(routes);

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
