'use strict';
var FS = require('fs');
var Path = require('path');
var rssFeed = require('../util/rss');
var team = require('../util/footer');
var baseDir = Path.join(__dirname, '..', '..');
var frontendDir = Path.join(baseDir, 'frontend');
var blogPost = require('../util/blogPost');

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

      var worker = FS.readFileSync(Path.join(frontendDir, 'js', 'download', 'workers', 'serviceworker.js'));
      var version = process.env.cache_time;

      worker = worker.toString().replace(/__CACHE_VERSION__/, version);
      reply(worker).type('application/javascript');
    }
  }
];
