'use strict';
var Path = require('path');
var pkg = require(Path.join(__dirname, '..', '..', 'package.json'));

// creates an array of authors names from the package.json with a few
// additional attribtues for easier handlebars formatting in the footer
var authors = pkg.authors.map(
  function(author, index, authors) {

    author.name = author.name.split(' ').shift();
    author.last = (index === authors.length - 1);
    author.secondToLast = (index === authors.length - 2);

    return author;
  });

module.exports = authors;
