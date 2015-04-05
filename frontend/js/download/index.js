'use strict';
var React = require('react');
var DownloadUI = React.createFactory(require('./DownloadUI'));
var currentSearch;
var shouldBuild;
require('fontfaceobserver');

new window.FontFaceObserver('Open Sans', {})
  .check()
  .then(function() {
    document.documentElement.className += ' font-loaded';
  });

if (location.hash.length || location.search.length) {
  var str = location.hash || location.search;
  var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
  var query = str.replace('#', '?');
  var queries = _.chain(query.replace(/^\?/, '').split('&'))
  .map(function(query) {
    return query.split('-');
  })
  .flatten()
  .value();

  if (queries.length) {
    shouldBuild = true;
    queries.map(function(query) {
      var searchResult = query.match(/q=(.*)/);
      if (searchResult) {
        currentSearch = unescape(searchResult[1]);
      } else {
        var matches = function(obj) {
          var prop = obj.property;
          if (_.isArray(prop)) {
            prop = prop.join('_');
          }
          if (query === prop.toLowerCase()) {
            obj.selected = true;
            return true;
          }
        };

        return _.some(window._options, matches) || _.some(window._metadata, matches);
      }
    });

    window.history.replaceState({}, '', baseUrl + query);
  }
}

if ('Worker' in window) {
  var buildWorker = new Worker('/js/download/buildWorker.js');
  var gzipWorker = new Worker('/js/download/gzipWorker.js');

  buildWorker.postMessage(JSON.stringify({
    requireConfig: window._modernizrConfig
  }));

  window.gziper = function(config, cb) {
    gzipWorker.postMessage(config);
    gzipWorker.onmessage = function(e) {
      cb(e.data);
    };
  };

  window.builder = function(config, cb) {
    buildWorker.onmessage = function(e) {
      cb(e.data);
    };
    buildWorker.postMessage(JSON.stringify({build: config}));
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

if (false && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js')
  .catch(function(error) {
    console.error(error);
  });
}

  ZeroClipboard.config({
    swfPath: '/lib/zeroclipboard/dist/ZeroClipboard.swf',
    forceHandCursor: true,
    flashLoadTimeout: 5000
  });

React.render(DownloadUI({
  detects: window._metadata,
  options: window._options,
  currentSearch: currentSearch,
  shouldBuild: shouldBuild
}), document.getElementById('main'));
