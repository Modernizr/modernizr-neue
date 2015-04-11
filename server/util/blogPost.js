'use strict';
var Path = require('path');
var Marked = require('marked');
var YMF = require('yaml-front-matter');
var baseName = Path.join(__dirname, '..', '..');

var url = function(filename) {
  // the url slug for each post is just jekyll style filename, without the date bits
  // e.g. `2000-01-01-altavista-is-great` becomes `altavista-is-great`
  // https://www.debuggex.com/r/qYTZlCoGt7vUoN0V
  return filename.replace(/^\d{4}-(?:\d{2}-){2}(.[^.]*).*$/, '$1');
};

var date = function(filename) {
  // generate the date for each post from the filename
  // for simplicity, we assume that its a valid input for a Date
  // https://www.debuggex.com/r/sIAScsUBL-dJefjA
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

  // Posts are written in the jekyll style - in markdown, with YAML front matter
  // http://jekyllrb.com/docs/frontmatter/
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
