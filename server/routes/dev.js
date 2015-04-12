'use strict';
var FS = require('fs');
var Path = require('path');
var team = require('../util/footer');
var blogPost = require('../util/blogPost');
var baseDir = Path.join(__dirname, '..', '..');
var frontendDir = Path.join(baseDir, 'frontend');

// export an array of Hapi routes for development only
// http://hapijs.com/api#route-options
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      // for the homepage, we need to grab the latest posts for news box
      FS.readdir(Path.join(baseDir, 'posts'), function(e, posts) {

        if (e) {
          return reply().code(500);
        }

        // we only need the latest 4 posts, so slice it up good
        posts = posts.reverse().slice(0, 4).map(blogPost);

        // hapi's `view` helper compiles a handlebars template (it supports a number
        // of templating engines). Its configured in `server/index.js`
        reply.view('index', {
          team: team,
          latestPosts: posts
        });
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

        // if the `post` parameter was given, that means that a specific post was
        // requests (e.g. `/news/wu-tang-clan-still-not-to-be-messed-with`, rather 
        // than just `/news`)
        if (post) {
          post = post.replace(/\/$/, '');

          // in order to easily get the posts before and after the requested post,
          // find the index of the requested file inside of all posts...
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

            // then build that post in particular
            post = blogPost(posts[index]);
            post.prevPost = blogPost(posts[index - 1]);
            post.nextPost = blogPost(posts[index + 1]);

        } else {
          // if no `post` was requested, we grab the most recent one
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
    path: '/feed',
    handler: function(request, reply) {
      var feedGenerator = require.resolve('../buildSteps/rss');
      var rssFeed = require(feedGenerator);
      // remove the cached reference to rssFeed, so that it is rebuilt on each request
      // when in development mode
      delete require.cache[feedGenerator];

      // I am still holding out hope that google reader will come back
      reply(rssFeed).type('text/xml');
    }
  }, {
    method: 'GET',
    path: '/favicon.ico',
    handler: function(request, reply) {
      reply.file(Path.join(frontendDir, 'img', 'favicon.ico'));
    }
  }, {
    method: 'GET',
    path: '/serviceworker.js',
    handler: function(request, reply) {

      // serviceworker has to be served from the document root, in order to be
      // able to cache the entire domain.
      var worker = FS.readFileSync(Path.join(frontendDir, 'js', 'download', 'workers', 'serviceworker.js'));

      // grab the cache_time var we set inside of the gulpfile so that we don't
      // end up with stale versions of the cache after rebuilding
      var version = process.env.cache_time;

      worker = worker.toString().replace(/__CACHE_VERSION__/, version);
      reply(worker).type('application/javascript');
    }
  }, {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: frontendDir
      }
    }
  }
];
