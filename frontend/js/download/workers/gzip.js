/*globals pako, prettyBytes*/
'use strict';
importScripts('/lib/pako/dist/pako_deflate.js', '/lib/pretty-bytes/pretty-bytes.js');

var hashCode = function(str) {
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash;
  }

  return hash;
};

var hash = {};

onmessage = function(msg) {
  var hashedConfig = hashCode(msg.data);
  var data = JSON.parse(msg.data);
  var build = data.build;
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
