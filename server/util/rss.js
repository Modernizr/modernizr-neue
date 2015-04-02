/*jshint camelcase: false */
'use strict';

var FS = require('fs');
var RSS = require('rss');
var Path = require('path');
var processPost = require('./blogPost');

var postsDir = Path.join(__dirname, '..', '..', 'posts');
var posts = FS.readdirSync(postsDir);

posts = posts
  .map(processPost)
  .map(function(post) {
    post.description = post.__content;
    post.url = 'https://modernizr.com/news/' + post.url;

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
  pubDate: posts[posts.length - 1].date,
  ttl: 24 * 60
});

// only send out the 20 most recent posts
posts.reverse().slice(0, 20).forEach(function(post) {
  feed.item(post);
});

module.exports = feed.xml();
