'use strict';
var Path = require('path');
var metadata = require('modernizr').metadata();

module.exports = [{
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: Path.join(__dirname, '..', 'frontend')
    }
  },
  lookupCompressed: true
}, {
  method: 'GET',
  path: '/i/js/modernizr/{param*}',
  handler: {
    directory: {
      path: Path.join(__dirname, '..', 'frontend', 'lib', 'modernizr')
    }
  },
}, {
  method: 'GET',
  path: '/i/js/modernizr/metadata.json',
  handler: function(request, reply) {
    reply(metadata);
  }
}
];
