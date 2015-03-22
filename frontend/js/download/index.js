'use strict';
var DownloadUI = require('./DownloadUI');
var React = require('react/dist/react.min');
require('fontfaceobserver');

new window.FontFaceObserver('Source Sans Pro', {})
  .check()
  .then(function() {
    document.documentElement.className += ' font-loaded';
  });

React.render(React.createElement(DownloadUI, {detects: window._metadata, options: window._options}), document.getElementById('main'));

if ('Worker' in window) {
  var worker = new Worker('/js/download/worker.js');

  worker.postMessage(JSON.stringify({
    requireConfig: window._modernizrConfig
  }));

  window.builder = function(config, cb) {
    worker.onmessage = function(e) {
      cb(e.data);
    };
    worker.postMessage(JSON.stringify({build: config}));
  };

  } else {

  window.builder = function() {
    var args = arguments;
    setTimeout(function() {
      window.builder.apply(this, args);
    }, 1000);
  };

  requirejs(['build'], function( _builder ) {
    window.builder = _builder;
  });
}
