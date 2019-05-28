'use strict';
var React = require('react');
var Modernizr = require('modernizr');

var DownloadModule = require('../../frontend/js/download/DownloadUI');
var downloadFactory = React.createFactory(DownloadModule);
var options = require('../util/modernizrOptions');

// render a static version of the `builder` for a faster inital render/script-less clients
module.exports = React.renderToString(downloadFactory({detects:Modernizr.metadata(), options: options}));
