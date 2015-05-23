'use strict';
var React = require('react/addons');
var DownloadUI = React.createFactory(require('./DownloadUI'));
var currentSearch;
var shouldBuild;

if (location.hash.length || location.search.length) {
  var str     = location.hash || location.search;
  var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
  var query   = str.replace('#', '?');
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

          if (query === prop.toLowerCase()
             || query === 'shiv' && prop === 'html5shiv'
             || query === 'printshiv' && prop === 'html5printshiv') {
            obj.selected = true;
            return true;
          }

          if (query === 'dontmin' && prop === 'minify') {
            obj.selected = false;
            return true;
          }
        };

        return _.some(window._options, matches) || _.some(window._modernizrMetadata, matches);
      }

      return query;
    });

    window.history.replaceState({}, '', baseUrl + query);
  }
}

if ('Worker' in window) {
  var buildWorker = new Worker('/js/download/workers/build.js');
  var gzipWorker = new Worker('/js/download/workers/gzip.js');

  buildWorker.postMessage(JSON.stringify({
    requireConfig: window._modernizrConfig,
    metadata: window._modernizrMetadata
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

if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')
   ) {
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
  detects: window._modernizrMetadata,
  options: window._options,
  currentSearch: currentSearch,
  shouldBuild: shouldBuild
}), document.getElementById('main'));
