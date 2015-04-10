'use strict';
var builder;

builder = function() {
  var args = arguments;
  setTimeout(function() {
    builder.apply(this, args);
  }, 1000);
};

onmessage = function(msg) {
  var run = JSON.parse(msg.data);

  if (run.build) {

    builder(run.build, function(build) {
      postMessage(build);
    });
  } else if (run.requireConfig) {
    self._modernizrConfig = run.requireConfig;
    importScripts('/lib/modernizr/lib/build.js');

    require(['build'], function(build) {
      builder = build;
    });
  }
};

importScripts('/js/lodash.custom.js', '/lib/r.js/dist/r.js');
define('lodash', function() {return _});
