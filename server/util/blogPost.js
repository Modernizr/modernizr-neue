'use strict';
if (!global.Intl) {
    global.Intl = require('intl');
}
var Path = require('path');
var Marked = require('marked');
var YMF = require('yaml-front-matter');
var baseName = Path.join(__dirname, '..', '..');

var url = function(filename) {
  return filename.replace(/^\d{4}-(?:\d{2}-){2}(.[^.]*).*$/, '$1');
};

var date = function(filename) {
  var str = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  var year = str[1];
  var month = str[2];
  var day = str[3];

  return new Date([month, day, year].join(' '));
};

var processPost = function(post) {

  if (!post) {
    return;
  }

  var file = Path.join(baseName, 'posts', post);
  var metadata = YMF.loadFront(file);

    metadata.filename = post;
    metadata.__content = Marked(metadata.__content);
    metadata.url = '/news/' + url(post);
    metadata.date = date(post);
    metadata.filename = metadata.url + '.html';

  return metadata;
};

module.exports = processPost;
