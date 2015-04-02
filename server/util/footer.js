'use strict';
var pkg = require('../../package.json');
var gravatar = require('gravatar');
var authors = pkg.authors;

authors = authors.map(function(author) {
  author.avatar = gravatar.url(author.email, {size: 128, d: 404}, true);
  return author;
});

module.exports = authors;
