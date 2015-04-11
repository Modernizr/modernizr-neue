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
}];
