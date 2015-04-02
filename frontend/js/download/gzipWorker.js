'use strict';
importScripts('/lib/pako/dist/pako_deflate.js', '/lib/pretty-bytes/pretty-bytes.js');
var hash = {};

onmessage = function(msg, cb) {
  var data = JSON.parse(msg.data);
  var build = data.build;
  var hashedConfig = btoa(data.config);
  var response = hash[hashedConfig];

  if (!response) {
    response = {
      original: prettyBytes(build.length),
      compressed: prettyBytes(pako.deflate(build, {level: 6}).length)
    };

    hash[hashedConfig] = response;
  }

  postMessage(response);
};
