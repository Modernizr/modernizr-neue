'use strict';
var _ = require('../../frontend/js/lodash.custom.js');
var modernizr = require('modernizr');
var marked = require('marked');
var path = require('path');
var fs = require('fs');
var he = require('he');

var base = path.join(__dirname, '..', '..');

var intro = fs.readFileSync(path.join(base, 'docs', 'intro.md'));

var options = modernizr.options(undefined, true);


options = _.merge(options, _.map(options, function(option) {
  return _.chain(option.tags)
    .map(function(tag) {
      return _.chain(tag)
        .values()
        .filter()
        .value();
    })
    .zipObject()
    .value();
}));

var parsedDocs = _.chain(options)
  .map(function(doc) {

    var block = '';

    if ('example' in doc) {

      block += '### ' + doc.name + '\n';

      if ('function' in doc) {
        block += '<code class="functionRef">' + doc.name + '(';

        var params = _.filter(doc.tags, {'title': 'param'})
          .map(function(tag) {
            if (tag.type && tag.type.type === 'OptionalType') {
              tag.optional = true;
            }

            return tag;
          })
          .reduce(function(curr, next, i, arr) {
            if (next.optional) {
              next.name = '[' + next.name + ']';
              next.description = 'Optional: ' + next.description;
            }

            if (++i !== arr.length) {
              next.name += ', ';
            }

            return curr + '<span class="functionArg" title="' + he.encode(next.description) + '">' + next.name + '</span>';
          }, '');


        block += params + ')</code>\n\n';
      }

      block += doc.example + '\n';
    }

    return block;
  })
  .filter()
  .value()
  .join('');


marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

module.exports = function() {
  return marked(intro + parsedDocs);
};
