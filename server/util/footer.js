'use strict';
var _ = require('lodash');
var Path = require('path');
var pkg = require(Path.join(__dirname, '..', '..', 'package.json'));

// creates an array of authors names from the package.json with a few
// additional attribtues for easier handlebars formatting in the footer
var authors = pkg.authors.map(
  function(author, index, authors) {

    return _.extend(author, {
      name: author.name.split(' ').shift(),
      last: (index === authors.length - 1),
      secondToLast: (index === authors.length - 2)
    });
  });

module.exports = authors;
