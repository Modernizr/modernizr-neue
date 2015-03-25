'use strict';
var React = require('react/dist/react.min');
var DownloadUI = React.createFactory(require('./DownloadUI'));
var currentSearch;
require('fontfaceobserver');

new window.FontFaceObserver('Source Sans Pro', {})
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
    queries.map(function(query) {
      var searchResult = query.match(/q=(.*)/);
      if (searchResult) {
        currentSearch = searchResult[1];
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

React.render(DownloadUI({
  detects: window._metadata,
  options: window._options,
  currentSearch: currentSearch
}), document.getElementById('main'));
