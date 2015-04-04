'use strict';
var Path = require('path');
var pkg = require(Path.join(__dirname, '..', '..', 'package.json'));
var authors = pkg.authors;

authors = authors.map(function(author, index, authors) {

  var name = author.name.split(' ').shift();

  if (index === authors.length - 1) {
    author.last = true;
  } else if (index === authors.length - 2) {
    author.secondToLast = true;
  }

  author.name = name;

  return author;
});

module.exports = authors;
