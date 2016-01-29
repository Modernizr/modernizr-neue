'use strict';
var React = require('react');
var Modernizr = require('modernizr');
var ReactDOMServer = require('react-dom/server');

var DownloadModule = require('../../frontend/js/download/DownloadUI');
var downloadFactory = React.createFactory(DownloadModule);
var options = require('../util/modernizrOptions');

// render a static version of the `builder` for a faster initial render/script-less clients
module.exports = ReactDOMServer.renderToString(downloadFactory({detects:Modernizr.metadata(), options: options}));
