'use strict';
var React = require('react/addons');
var DownloadUI = React.createFactory(require('./DownloadUI'));
var shouldBuild;
var useHash;
var initialState = {
  currentSearch: undefined,
  classPrefix: undefined
};

if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')
   ) {
  navigator.serviceWorker.register('/serviceworker.js')
  .catch(function(error) {
    console.error(error);
  });
} else if ('applicationCache' in window) {
    var iframe = document.createElement('iframe');
    iframe.src = '/download-appcache';
    iframe.className='hidden';
    document.body.appendChild(iframe);

    useHash = true;
    localStorage.setItem('useHash', useHash);

    applicationCache.addEventListener('error', function(e) {
      try {
        Bugsnag.notifyException(e);
      } catch (e) {
      }
    });
}


if (location.hash.length || location.search.length) {
  var goodSeparator = useHash ? '#' : '?';
  var badSeparator = useHash ? '?' : '#';
  var str     = location.hash || location.search;
  var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
  var query   = str.replace(badSeparator, goodSeparator);
  var queries = _.chain(query.replace(/^\?/, '').split('&'))
    .map(function(query) {
      return query.split('-');
    })
    .flatten()
    .value();

  if (queries.length) {
    shouldBuild = true;

    queries.forEach(function(query) {
      var searchResult = query.match(/q=(.*)/);
      if (searchResult) {
        initialState.currentSearch = unescape(searchResult[1]);
      } else {
        var clearQuery = query.replace('#', '');
        var matches = function(obj) {
          var prop = obj.property;
          if (_.isArray(prop)) {
            prop = prop.join('_');
          }

          if (_.contains(clearQuery, 'cssclassprefix')) {
            var splittedQuery = clearQuery.split(':');
            if (splittedQuery.length === 2 && splittedQuery[1].length > 0) {
              initialState.classPrefix = splittedQuery[1];
            }
          }

          if (clearQuery === prop.toLowerCase()
             || clearQuery === 'shiv' && prop === 'html5shiv'
             || clearQuery === 'printshiv' && prop === 'html5printshiv'
             || obj.builderAliases && _.contains(obj.builderAliases, clearQuery)
             || clearQuery === 'do_not_use_in_production') {
            obj.checked = true;
            return true;
          }

          if (clearQuery === 'dontmin' && prop === 'minify') {
            obj.checked = false;
            return true;
          }
        };

        if(queries.length === 1 && clearQuery === 'do_not_use_in_production') {
          _.chain(_.union(window._options, window._modernizrMetadata))
            .filter(function(option) {
              if(_.isArray(option.property)) {
                return true;
              }
              return option.property.toLowerCase() !== 'html5printshiv';
            })
            .forEach(matches)
            .value();
        } else {
          _.some(window._options, matches) || _.some(window._modernizrMetadata, matches);
        }
      }
    });

    if (useHash) {
      if (location.search.length) {
        window.history.replaceState({}, '', baseUrl);
      }
      location.hash = query;
    } else {
      window.history.replaceState({}, '', baseUrl + query);
    }
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
  initialState: initialState,
  shouldBuild: shouldBuild
}), document.getElementById('main'));
