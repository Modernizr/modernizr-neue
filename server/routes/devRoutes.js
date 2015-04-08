'use strict';
var FS = require('fs');
var Path = require('path');
var Modernizr = require('modernizr');
var modernizrMetadata = Modernizr.metadata();
var modernizrOptions = Modernizr.options();
var builderContent = require(Path.join('..', 'buildSteps', 'download'));
var baseDir = Path.join(__dirname, '..', '..');
var blogPost = require(Path.join('..', 'util', 'blogPost'));
var frontendDir = Path.join(baseDir, 'frontend');
var rssFeed = require(Path.join('..', 'util', 'rss'));
var team = require(Path.join('..', 'util', 'footer'));

var downloaderConfig = {
  metadata: JSON.stringify(modernizrMetadata),
  options: JSON.stringify(modernizrOptions),
  builderContent: builderContent,
  scripts: [
    '/js/lodash.custom.js',
    '/js/modernizr.custom.js',
    '/lib/zeroclipboard/dist/ZeroClipboard.js',
    '/lib/r.js/dist/r.js',
    '/lib/modernizr/lib/build.js',
    '/js/download/downloader.js',
  ],
  team: team
};

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function(request, reply) {

      FS.readdir(Path.join(baseDir, 'posts'), function(e, posts) {

        if (e) {
          return reply().code(500);
        }

        posts = posts.reverse().slice(0, 4).map(blogPost);
        reply.view('index', {team: team, latestPosts: posts});
      });
    }
  }, {
    method: 'GET',
    path: '/download',
    handler: function(request, reply) {

      reply.view('pages/download', downloaderConfig);
    }
  }, {
    method: 'GET',
    path: '/news/{post*}',
    handler: function(request, reply) {
      var postRegExp = /\d{4}-\d\d-\d\d-(.*).markdown/;

      var post = request.params.post;
      var index;

      FS.readdir(Path.join(baseDir, 'posts'), function(e, posts) {

        if (e) {
          return reply().code(500);
        }

        if (post) {
          post = post.replace(/\/$/, '');

          index = posts
            .map(function(file, index) {
              var match = file.match(postRegExp);
              if (match && match[1] === post) {
                return index;
              }
            })
            .filter(function(index) {
              return index !== undefined;
            })
            .pop();

            post = blogPost(posts[index]);
            post.prevPost = blogPost(posts[index - 1]);
            post.nextPost = blogPost(posts[index + 1]);

        } else {
          post = blogPost(posts[posts.length - 1]);
          post.posts = posts.slice(0, -1).reverse().map(blogPost);
        }

        reply.view('pages/news', {
          post: post,
          team: team
        });
      });
    }
  }, {
    method: 'GET',
    path: '/news/posts',
    handler: function(request, reply) {
      var postRegExp = /\d{4}-\d\d-\d\d-(.*).markdown/;

      var post = request.params.post;
      var index;

      FS.readdir(Path.join(baseDir, 'posts'), function(e, posts) {

        if (e) {
          console.log(e);
          return reply().code(500);
        }

        if (post) {
          post = post.replace(/\/$/, '');

          index = posts
            .map(function(file, index) {
              var match = file.match(postRegExp);
              if (match && match[1] === post) {
                return index;
              }
            })
            .filter(function(file) {
              return !!file;
            })
            .pop();
        } else {
          index = posts.length - 1;
        }

        post = blogPost(posts[index]);
        post.prevPost = blogPost(posts[index - 1]);
        post.nextPost = blogPost(posts[index + 1]);
        post.team = team;

        reply.view('pages/news', post);
      });
    }
  }, {
    method: 'GET',
    path: '/feed',
    handler: function(request, reply) {
      reply(rssFeed).type('text/xml');
    }
  }, {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: frontendDir
      }
    }
  }, {
    method: 'GET',
    path: '/serviceworker.js',
    handler: function(request, reply) {

      reply.file(Path.join(frontendDir, 'js', 'download', 'workers', 'serviceworker.js'));
    }
  }
];
