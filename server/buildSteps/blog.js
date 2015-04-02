'use strict';
if (!global.Intl) {
    global.Intl = require('intl');
}
var FS = require('fs');
var Path = require('path');
var Marked = require('marked');
var YMF = require('yaml-front-matter');
var htmlmin = require('gulp-htmlmin/node_modules/html-minifier');

var Handlebars = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');

HandlebarsIntl.registerWith(Handlebars);

var basename = Path.join(__dirname, '..', 'posts');
var posts = FS.readdirSync(basename);


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

posts
  .map(function(post) {
    var file = FS.readFileSync(Path.join(basename, post), 'utf8');
    var metadata = YMF.loadFront(file);

    metadata.filename = post;
    metadata.__content = Marked(metadata.__content);
    metadata.url = url(post);
    metadata.date = date(post);
    metadata.filename = metadata.url + '.html';

    return metadata;
  })
  .forEach(function(post, index, posts) {
    var templatePath = Path.join(__dirname, '..', '..', 'frontend', 'templates', 'partials', post.layout + '.hbs');
    var template = FS.readFileSync(templatePath).toString();
    var compiledTemplate = Handlebars.compile(template);

    var prevPost = posts[index - 1];
    var nextPost = posts[index + 1];

    if (prevPost) {
      post.prevPost = {
        title: prevPost.title,
        url: prevPost.url
      };
    }

    if (nextPost) {
      post.nextPost = {
        title: nextPost.title,
        url: nextPost.url
      };
    }

    var output = htmlmin.minify(compiledTemplate(post), {
        collapseWhitespace: true,
        removeAttributeQuotes: true
      });

    FS.writeFileSync(Path.join(basename, post.filename), output, { encoding: 'utf8'});

    if (!nextPost) {
      FS.writeFileSync(Path.join(basename, 'index.html'), output, { encoding: 'utf8'});
    }
  });
