'use strict';
var React = require('react');
var Modernizr = require('modernizr');

var DownloadModule = require('../../frontend/js/download/DownloadUI');
var downloadFactory = React.createFactory(DownloadModule);
module.exports = React.renderToString(downloadFactory({detects:Modernizr.metadata(), options: Modernizr.options()}));
