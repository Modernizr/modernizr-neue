'use strict';
var React = require('react');
var Modernizr = require('modernizr');

var DownloadModule = require('../../frontend/js/download/DownloadUI');
var downloadFactory = React.createFactory(DownloadModule);
var options = Modernizr.options().concat({
      name: 'minify',
      property: 'minify',
      group: 'minify',
      selected: true
    });

module.exports = React.renderToString(downloadFactory({detects:Modernizr.metadata(), options: options}));
