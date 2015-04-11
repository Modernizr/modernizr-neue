'use strict';
var pkg = require('modernizr/package.json');

// used to generate a bower.json file for the bower download service
function bowerJSON() {
  return {
    'name': 'Modernizr',
    'description': pkg.description,
    'version': pkg.version,
    'authors': pkg.contributors.map(function(author) {return author.name;}),
    'homepage': 'https://modernizr.com',
    'ignore': [],
    'license': pkg.license,
    'main': 'modernizr.custom.js',
    'moduleType': 'globals',
    'private': true,
    'repository': pkg.repository
  };
}

module.exports = bowerJSON;
