'use strict';
var del = require('del');
var gulp = require('gulp');
var modernizr = require('modernizr');
var browserify = require('browserify');
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var source = require('vinyl-source-stream');
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
  var templateData = {
    metadata: JSON.stringify(modernizr.metadata()),
    options: JSON.stringify(modernizr.options()),
    builderContent: require('./server/builderBuild.js'),
    scripts: [
      '/js/prod.js',
      '/lib/r.js/dist/r.js',
      '/lib/modernizr/lib/build.js',
    ]
  };

  return gulp.src([
    'frontend/templates/pages/**/*.hbs',
    'frontend/templates/index.hbs'
  ])
    .pipe(plugins.handlebars(templateData, {
      batch: ['frontend/templates']
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
    'frontend/js/download/worker.js',
    'frontend/lib/r.js/dist/r.js',
    'frontend/js/lodash.custom.js',
    'frontend/lib/requirejs-plugins/**/*.js'
  ], {base: './frontend'})
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));
});

gulp.task('develop', function () {
  var tasks = ['styles', 'modernizr', 'lodash', 'browserify'];
  plugins.nodemon({
    script: 'server/index.js',
    ext: 'html js styl hbs',
    ignore: [
      'dist',
      'node_modules',
      'frontend/lib',
      'frontend/css',
      'frontend/js/*.custom.js',
      'frontend/js/modernizr-metadata.js'
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

gulp.task('deploy', function(cb) {
  runSequence(
    'clean',
    'styles',
    ['handlebars', 'lodash', 'modernizr'],
    ['uglify-combined', 'uglify-loose'],
    'copy',
    'compress',
  cb);
});
