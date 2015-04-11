'use strict';
var Path = require('path');

// prod is intentionally extremely small. everything should be served statically,
// with the exception of things we setup in the shared routes in `routes/index.js`
module.exports = [{
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: Path.join(__dirname, '..', 'dist')
    }
  },
  lookupCompressed: true
}];
