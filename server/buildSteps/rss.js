/*jshint camelcase: false */
'use strict';

var posts;
var FS = require('fs');
var RSS = require('rss');
var Path = require('path');
var postsDir = Path.join(__dirname, '..', '..', 'posts');
var processPost = require(Path.join(__dirname, '..', 'util', 'blogPost'));

posts = FS.readdirSync(postsDir)
  .map(processPost)
  .map(function(post) {
    post.description = post.__content;
    post.url = 'https://modernizr.com/news/' + post.url;

    // since the entire object gets pusted into the feed, we strip out the
    // stuff we don't want, or at least don't want duplicated
    delete post.layout;
    delete post.filename;
    delete post.__content;

    return post;
  });

var feed = new RSS({
  title: 'Offical Modernizr.com Blog',
  description: 'Front-End Development Done Right',
  feed_url: 'https://modernizr.com/feed',
  site_url: 'https://modernizr.com',
  image_url: 'https://modernizr.com/img/logo.png',
  language: 'en-US',
  pubDate: posts.slice(-1).date,
  // ttl = Number of minutes feed can be cached
  ttl: 24 * 60
});

// only send out the 20 most recent posts
posts.reverse().slice(0, 20).forEach(function(post) {
  feed.item(post);
});

module.exports = feed.xml();
