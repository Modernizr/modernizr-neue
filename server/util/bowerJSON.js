'use strict';
var pkg = require('modernizr/package.json');

function bowerJSON() {
  return {
    'name': 'Modernizr',
    'description': 'a JavaScript library that detects HTML5 and CSS3 features in the user’s browser.',
    'version': pkg.version,
    'authors': pkg.contributors.map(function(author) {return author.name;}),
    'homepage': 'https://modernizr.com',
    'ignore': [],
    'license': 'MIT',
    'main': 'modernizr.custom.js',
    'moduleType': 'globals',
    'private': true,
    'repository': pkg.repository
  };
}

module.exports = bowerJSON;
