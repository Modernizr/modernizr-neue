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
             || query === 'printshiv' && prop === 'html5printshiv'
             || obj.builderAliases && _.contains(obj.builderAliases, query)
             || query === 'do_not_use_in_production') {
            obj.checked = true;
            return true;
          }

          if (query === 'dontmin' && prop === 'minify') {
            obj.checked = false;
            return true;
          }
        };

        if(queries.length === 1 && query === 'do_not_use_in_production') {
          _.chain(_.union(window._options, window._modernizrMetadata))
            .filter(function(option) {
              if(_.isArray(option.property)) {
                return true;
              }
              return option.property.toLowerCase() !== 'html5printshiv'
            })
            .forEach(matches)
            .value();
        } else {
          return _.some(window._options, matches) || _.some(window._modernizrMetadata, matches);
        }
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

if (!('contains' in SVGElement.prototype)) {
  SVGElement.prototype.contains = function contains(node) {
    if (!(0 in arguments)) {
      throw new TypeError('1 argument is required');
    }

    do {
      if (this === node) {
        return true;
      }
    } while (node = node && node.parentNode);

    return false;
  };
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
