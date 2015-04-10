'use strict';
importScripts('/lib/serviceworker-cache-polyfill.js/dist/serviceworker-cache-polyfill.js');

var CACHE_VERSION = '__CACHE_VERSION__';
var CURRENT_CACHES = {
  prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var urlsToPrefetch = [
    '/download',
    '/download/index.html',
    '/css/main.css',
    '/css/builder.css',
    '/js/prod.js',
    '/lib/r.js/dist/r.js',
    '/js/lodash.custom.js',
    '/js/modernizr.custom.js',
    '/js/download/downloader.js',
    '/lib/modernizr/lib/build.js',
    '/lib/zeroclipboard/dist/ZeroClipboard.js',
    '/img/logo.svg',
    '/img/menu.svg'
  ];

  event.waitUntil(
    caches.open(CURRENT_CACHES['prefetch']).then(function(cache) {
      return cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
        return new Request(urlToPrefetch, {mode: 'no-cors'});
      }));
    }).catch(function(error) {
      console.error('Pre-fetching failed:');
      console.log(error);
    })
  );
});

self.addEventListener('activate', function(event) {
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) == -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }

      console.log(event.request.url);

      return fetch(event.request).then(function(response) {
        console.log('Response from network is:', response);

        return response;
      }).catch(function(error) {
        console.error('Fetching failed:', error);

        throw error;
      });
    })
  );
});
