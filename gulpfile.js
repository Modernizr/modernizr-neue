'use strict';
var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var modernizr = require('modernizr');
var browserify = require('browserify');
var feed = require('./server/util/rss');
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var source = require('vinyl-source-stream');
var blogPost = require('./server/util/blogPost');
var authors = require('./server/util/footer');

var plugins = require('gulp-load-plugins')({
  rename: {
    'gulp-minify-css': 'minify_css',
    'gulp-compile-handlebars': 'handlebars'
  }
});

gulp.task('browserify', function() {
  return browserify('./frontend/js/download/index.js')
    .bundle()
    .pipe(source('downloader.js'))
  .pipe(gulp.dest('frontend/js/download/'));
});

gulp.task('handlebars', function() {
  var posts = fs.readdirSync('./posts').reverse().map(blogPost);
  var post = posts.shift();
  post.posts = posts;

  var templateData = {
    metadata: JSON.stringify(modernizr.metadata()),
    options: JSON.stringify(modernizr.options()),
    builderContent: require('./server/buildSteps/download.js'),
    scripts: [
      '/js/prod.js',
      '/lib/r.js/dist/r.js',
      '/lib/modernizr/lib/build.js',
    ],
    post: post,
    team: authors
  };

  return gulp.src([
    'frontend/templates/pages/**/*.hbs',
    'frontend/templates/index.hbs'
  ])
    .pipe(plugins.handlebars(templateData, {
      batch: ['frontend/templates'],
      helpers: {
        formatDate: require('./frontend/templates/helpers/formatDate')
      }
    }))
    .pipe(plugins.htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(plugins.rename(function(path) {
      if (path.basename !== 'index') {
        path.dirname += '/' + path.basename;
        path.basename = 'index';
      }
      path.extname = '.html';
    }))
  .pipe(gulp.dest('dist'));
});

gulp.task('blog', function() {
  var tasks = fs
    .readdirSync('./posts')
    .reverse()
    .map(blogPost)
    .map(function(post, index, posts) {
      post.prevPost = posts[index - 1];
      post.nextPost = posts[index + 1];

      return post;
    })
    .map(function(post) {

      return gulp.src('frontend/templates/pages/news.hbs')
        .pipe(plugins.handlebars({post: post, team: authors}, {
          batch: ['frontend/templates'],
          helpers: {
            formatDate: require('./frontend/templates/helpers/formatDate')
          }
        }))
        .pipe(plugins.htmlmin({
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          minifyJS: true,
          minifyCSS: true
        }))
        .pipe(plugins.rename(function(path) {
          path.dirname += '/' + post.filename.replace('.html', '');
          path.basename = 'index';
          path.extname = '.html';
        }))
      .pipe(gulp.dest('dist'));
    });

    return merge(tasks);
});

gulp.task('rss', function(cb) {
  fs.writeFile('dist/feed', feed, cb);
});

gulp.task('styles', function() {
  return gulp.src([
    'frontend/styl/main.styl',
    'frontend/styl/builder/builder.styl'
  ])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.stylus())
      .pipe(plugins.autoprefixer())
      .pipe(plugins.minify_css())
    .pipe(plugins.sourcemaps.write('.', {sourceMappingURLPrefix: '/css/'}))
  .pipe(gulp.dest('frontend/css'));
});

gulp.task('modernizr', function(cb) {
  var detects = [
    'adownload',
    'blobconstructor',
    'flash'
  ].join();

  var output = 'frontend/js/modernizr.custom.js';
  var metadata = 'frontend/js/modernizr-metadata.json';

  return exec('./node_modules/.bin/modernizr -f ' + detects + ' -d ' + output,
    exec('./node_modules/.bin/modernizr -u -m ' + metadata,
      cb
    )
  );
});

gulp.task('lodash', function(cb) {
  var includes = [
    'chain',
    'contains',
    'defer',
    'filter',
    'find',
    'flatten',
    'forEach',
    'intersection',
    'isArray',
    'isEmpty',
    'isEqual',
    'map',
    'pluck',
    'reduce',
    'some',
    'without'
  ].join();

  var output = 'frontend/js/lodash.custom.js';

  return exec('./node_modules/.bin/lodash include=' + includes + ' -d -o ' + output, cb);
});

gulp.task('uglify-combined', function() {
  return gulp.src([
    'frontend/js/*.custom.js',
    'frontend/lib/zeroclipboard/dist/ZeroClipboard.js',
    'frontend/js/download/downloader.js'
  ])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.concat('prod.js'))
      .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('frontend/js'));
});

gulp.task('uglify-loose', function() {
  return gulp.src([
    'frontend/js/download/buildWorker.js',
    'frontend/js/download/gzipWorker.js',
    'frontend/lib/pako/dist/pako_deflate.js',
    'frontend/lib/pretty-bytes/pretty-bytes.js',
    'frontend/lib/r.js/dist/r.js',
    'frontend/lib/serviceworker-cache-polyfill.js/dist/serviceworker-cache-polyfill.js',
    'frontend/js/lodash.custom.js',
    'frontend/lib/requirejs-plugins/**/*.js'
  ], {base: './frontend'})
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));
});

gulp.task('uglify-sw', function() {
  // uglify service worker seperatly, becuase it has to be served
  // from the root of the domain, so its `base` is different
  return gulp.src('frontend/js/download/serviceworker.js', {base: 'frontend/js/download/'})
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['uglify-combined', 'uglify-loose', 'uglify-sw']);

gulp.task('develop', function () {
  var tasks = ['modernizr', 'lodash', 'browserify', 'styles'];

  plugins.nodemon({
    script: 'server/index.js',
    ext: 'html js styl hbs',
    ignore: [
      'dist',
      'node_modules',
      'frontend/lib',
      'frontend/css',
      'frontend/js/*.custom.js',
      'frontend/js/modernizr-metadata.js',
      'frontend/js/download/downloader.js'
    ]
  })
    .on('start', tasks)
    .on('change', tasks)
    .on('restart', function () {
      console.log('restarted!');
    });
});

gulp.task('clean', function(cb) {
  return del([
    'dist',
    'frontend/js/prod.js',
    'frontend/js/*.custom.js'
  ], cb);
});

gulp.task('copy-styles', function() {
  return gulp.src('frontend/css/*')
    .pipe(plugins.copy('dist', {prefix: 1}));
});

gulp.task('copy-img', function() {
  return gulp.src('frontend/img/*')
    .pipe(plugins.copy('dist', {prefix: 1}));
});

gulp.task('copy-scripts', function() {
  return gulp.src([
    'frontend/js/prod.js*',
    'frontend/lib/modernizr/**/*',
    'frontend/js/modernizr-metadata.json',
    '!frontend/lib/modernizr/node_modules/**/*',
    'frontend/lib/zeroclipboard/dist/ZeroClipboard.swf'
  ])
    .pipe(plugins.copy('dist', {prefix: 1}));
});

gulp.task('copy', ['copy-styles', 'copy-img', 'copy-scripts']);

gulp.task('compress', function() {
  return gulp.src('dist/**/*')
    .pipe(plugins.zopfli())
  .pipe(gulp.dest('dist'));
});

gulp.task('gh-pages', ['deploy'], function(cb) {
  return del([
    'dist/**/*.gz',
    'dist/**/*.map',
    '!dist'
  ], fs.writeFile('dist/CNAME','new.modernizr.com', cb));
});

gulp.task('deploy', function(cb) {
  runSequence(
    'clean',
    'styles',
    ['browserify', 'handlebars', 'lodash', 'modernizr'],
    'uglify',
    'copy',
    ['blog', 'rss'],
    'compress',
  cb);
});
