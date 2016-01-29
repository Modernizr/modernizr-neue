'use strict';
var fs               = require('fs');
var del              = require('del');
var gulp             = require('gulp');
var path             = require('path');
var globby           = require('globby');
var aliasify         = require('aliasify');
var merge            = require('merge-stream');
var modernizr        = require('modernizr');
var browserify       = require('browserify');
var exec             = require('child_process').exec;
var source           = require('vinyl-source-stream');
var zopfli           = require('imagemin-zopfli');
var authors          = require('./server/util/footer');
var feed             = require('./server/buildSteps/rss');
var blogPost         = require('./server/util/blogPost');
var modernizrOptions = require('./server/util/modernizrOptions');

var plugins = require('gulp-load-plugins')({
  rename: {
    'gulp-clean-css': 'cleanCSS',
    'gulp-compile-handlebars': 'handlebars'
  }
});

// set a global var representing when the site was built.
// right now, this is only used in serviceworkers.js to prevent stale caches
process.env.cache_time = Date.now();

// browserify is used to build the react portions of the app, currently only `/download`
gulp.task('browserify', function() {
  // the react lib has wonderful debugging messages, but it comes at the cost of a much
  // larger lib. So use the `.min` mode when building the production site to save those byte$
  var reactVersion = process.env.NODE_ENV === 'production' ? 'react/dist/react.min' : 'react';

  return browserify('./frontend/js/download/index.js')
    .transform(aliasify, {
      aliases: {
        'react': reactVersion
      }
    })
    .bundle()
    .pipe(source('downloader.js'))
  .pipe(gulp.dest('frontend/js/download/'));
});

gulp.task('global_browserify', function() {
  return browserify('./frontend/js/index.js')
  .bundle()
  .pipe(source('build.js'))
  .pipe(gulp.dest('./frontend/js/'));
});

// `handlebars` is used for pretty much everything except for `/download`, however
// this task is only for building the static, production version. When running in
// `develop`, all of the handlebars compilation is handled by Hapi, most of those
// configurations are found in `server/routes/dev`. Functionally, it should result
// in the same output.
gulp.task('handlebars', function() {
  var posts = fs.readdirSync('./posts').reverse().map(blogPost);
  // `latestPosts` is used for the blog posts slugs on the homepage
  var latestPosts = posts.slice(0, 4);
  var metadata = modernizr.metadata();
  var docs = require('./server/util/docs');

  // `post` is used for the default blog post, on `/news`
  var post = posts.shift();
  post.posts = posts;

  var templateData = {
    metadata: JSON.stringify(metadata),
    options: JSON.stringify(modernizrOptions),
    builderContent: require('./server/buildSteps/download.js'),
    scripts: [
      '/js/lodash.custom.js',
      '/js/prod.js',
      '/lib/r.js/dist/r.js',
      '/lib/modernizr/lib/build.js'
    ],
    latestPosts: latestPosts,
    team: authors,
    docs: docs(),
    features: metadata,
    post: post
  };

  return gulp.src([
    'frontend/templates/pages/**/*.hbs',
    'frontend/templates/index.hbs'
  ])
    .pipe(plugins.handlebars(templateData, {
      batch: ['frontend/templates'],
      helpers: {
        formatDate: require('./frontend/templates/helpers/formatDate'),
        ternary: require('./frontend/templates/helpers/ternary'),
        copyright: require('./frontend/templates/helpers/copyright')
      }
    }))
    .pipe(plugins.htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(plugins.rename(function(path) {
      // since this is for the static site, we want `/news/post` rather than
      // `/news/post.html`.
      if (path.basename !== 'index') {
        path.dirname += '/' + path.basename;
        path.basename = 'index';
      }
      path.extname = '.html';
    }))
  .pipe(gulp.dest('dist'));
});

// `news` builds out everything under
gulp.task('news', function() {
  var tasks = fs
    .readdirSync('./posts')
    // reverse, so its orders from newest to oldest
    .reverse()
    .map(blogPost)
    .map(function(post, index, posts) {
      // used for the links at the bottom of each blog post
      post.prevPost = posts[index + 1];
      post.nextPost = posts[index - 1];

      return post;
    })
    .map(function(post) {

      // the meat of the actual task. Since we only have one source file for gulp
      // to use, we iterate over each markdown blog post file, run each one through
      // its own anonymous task, then merge them all at the end
      return gulp.src('frontend/templates/pages/news.hbs')
        // team is used for the footer
        .pipe(plugins.handlebars({post: post, team: authors}, {
          batch: ['frontend/templates'],
          helpers: {
            formatDate: require('./frontend/templates/helpers/formatDate'),
            ternary: require('./frontend/templates/helpers/ternary'),
            copyright: require('./frontend/templates/helpers/copyright')
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
  // process the two styl files separately since the `builder` sheet is quite a
  // bit larger, and not needed on a majority of the site.
  return gulp.src([
    'frontend/styl/main.styl',
    'frontend/styl/builder/builder.styl'
  ])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.stylus())
      .pipe(plugins.autoprefixer())
      .pipe(plugins.cleanCSS())
    .pipe(plugins.sourcemaps.write('.', {sourceMappingURLPrefix: '/css/'}))
  .pipe(gulp.dest('frontend/css'));
});

// `modernizr` builds a custom version of modernizr needed for the site
gulp.task('modernizr', function(cb) {
  var detects = [
    'adownload',
    'blobconstructor',
    'flash'
  ].join();

  var output = 'frontend/js/modernizr.custom.js';

  return exec(`${path.resolve('./node_modules/.bin/modernizr')} -f ${detects} -d ${output}`,
    cb
  );
});

// lodash builds our custom version of lodash. try and keep it tight.
gulp.task('lodash', function(cb) {
  var includes = [
    'chain',
    'defer',
    'extend',
    'filter',
    'find',
    'first',
    'flatten',
    'forEach',
    'includes',
    'intersection',
    'isArray',
    'isEmpty',
    'isEqual',
    'map',
    'merge',
    'reduce',
    'some',
    'union',
    'without',
    'zipObject'
  ].join();

  var output = 'frontend/js/lodash.custom.js';

  return exec(`${path.resolve('./node_modules/.bin/lodash')} include=${includes} -d -o ${output}`, cb);
});

// `uglify-combined` outputs one giant glob of javascript used on `/download`
gulp.task('uglify-combined', function() {
  return gulp.src([
    'frontend/js/modernizr.custom.js',
    'frontend/lib/zeroclipboard/dist/ZeroClipboard.js',
    'frontend/js/download/downloader.js'
  ])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.concat('prod.js'))
      .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('frontend/js'));
});

// `uglify-loose` uglifies each one of the files listed in `src` individually, as they
// are requested by the pages and workers one at a time (rather than one large file).
// HTTP2 is coming soon, anyway yall
gulp.task('uglify-loose', function() {
  return gulp.src([
    'frontend/js/download/workers/build.js',
    'frontend/js/download/workers/gzip.js',
    'frontend/lib/pako/dist/pako_deflate.js',
    'frontend/lib/pretty-bytes/pretty-bytes.js',
    'frontend/lib/r.js/dist/r.js',
    'frontend/lib/serviceworker-cache-polyfill.js/index.js',
    'frontend/js/lodash.custom.js',
    'frontend/lib/requirejs-plugins/**/*.js'
  ], {base: './frontend'})
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));
});


gulp.task('uglify-sw', function() {
  // uglify service worker separately, because it has to be served by itself
  // from the root of the domain, so its `base` is different from all the
  // scripts in `uglify-loose`
  return gulp.src('frontend/js/download/workers/serviceworker.js', {base: 'frontend/js/download/workers/'})
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.replace('__CACHE_VERSION__', process.env.cache_time))
      .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));
});

gulp.task('uglify', gulp.series('uglify-combined', 'uglify-loose', 'uglify-sw'));

gulp.task('appcache', function() {
  var modernizrFiles = globby.sync([
    './frontend/lib/modernizr/lib/**/*.js',
    './frontend/lib/modernizr/src/**/*.js',
    './frontend/lib/modernizr/feature-detects/**/*.js'
  ], {
    cwd: ''
  }).join('\n');

  return gulp.src('frontend/offline.appcache')
    .pipe(plugins.replace('__CACHE_VERSION__', process.env.cache_time))
    .pipe(plugins.replace('__ASSETS__', modernizrFiles))
    .pipe(plugins.replace('./frontend', ''))
  .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb) {
  return del([
    'dist',
    'frontend/js/prod.js',
    'frontend/js/*.custom.js'
  ], cb);
});

// grab all of the compiled stylus files and put them into the production dir
gulp.task('copy-styles', function() {
  return gulp.src('frontend/css/*')
    .pipe(plugins.copy('dist', {prefix: 1}));
});

// same thing for the images
gulp.task('copy-img', function() {
  var img = gulp.src([
      'frontend/img/*',
      '!frontend/img/favicon.ico'
    ])
    .pipe(plugins.copy('dist', {prefix: 1}));

  var favicon = gulp.src([
      'frontend/img/favicon.ico'
    ])
    .pipe(plugins.copy('dist', {prefix: 2}));

  return merge([img, favicon]);
});

// and for all of the scripts that were not uglified (the uglify tasks already
// output files in the `dist` dir), as well as their sourcemaps
gulp.task('copy-scripts', function() {
  return gulp.src([
    'frontend/js/prod.js*',
    'frontend/lib/modernizr/**/*',
    '!frontend/lib/modernizr/node_modules/**/*',
    'frontend/lib/zeroclipboard/dist/ZeroClipboard.swf',
    'frontend/js/build.js'
  ])
  .pipe(plugins.copy('dist', {prefix: 1}));
});

gulp.task('copy', gulp.series('copy-styles', 'copy-img', 'copy-scripts'));

// smooch everything down with zopfli (http://en.wikipedia.org/wiki/Zopfli)
// Hapi has built in support for serving precompressed files (when configured),
// so we get a ~8% filesize reduction
gulp.task('compress', function() {
  return gulp.src('dist/**/*')
    .pipe(plugins.imagemin({
        use: [zopfli()]
    }))
  .pipe(gulp.dest('dist'));
});

// separate out the tasks that are repeated in both deploy and develop steps.
var tasks = ['modernizr', 'lodash', 'browserify', 'global_browserify', 'styles', 'appcache'];

var env;

gulp.task('set:production', function(cb) {
  env = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  cb();
});

// `deploy` builds the static version of the site. Assuming a javascript supported
// client, everything _should_ work 100% when built. Note that there are a few
// progressive enhancements in `/server/routes/index` to allow for scriptless
// clients, and the bower download support
gulp.task('deploy', gulp.series('set:production',
    'clean',
    'styles',
    tasks,
    'handlebars',
    'uglify',
    'copy',
    ['news', 'rss'],
    'compress',
  function(cb) {
    process.env.NODE_ENV = env;
    cb();
  }));

// develop is your live server. Its not very pretty, and rebuilds everything on
// every change, but it gets the job done
gulp.task('develop', function () {

  plugins.nodemon({
    script: 'server/index.js',
    ext: 'html js styl hbs md',
    ignore: [
      'dist',
      'node_modules',
      'frontend/lib',
      'frontend/css',
      'frontend/js/*.custom.js',
      'frontend/js/download/downloader.js',
      'frontend/js/build.js'
    ]
  })
    .on('start', tasks)
    .on('change', tasks)
    .on('restart', function () {
      // reset the cache version var for the serviceworker
      process.env.cache_time = Date.now();
      console.log('restarted!');
    });
});


// in case the hapi server falls over, or if we just want to test what changes
// look like, the gh-pages task is used by travis.ci to automatically upload
// a compiled version of the `master` branch to the `gh-pages` branch. In order
// to prevent a whole lotta bloat in the git repo, we remove all of the sourcemaps
// and zopfli compressed files. The CNAME file is used by github to allow for a
// custom domain (http://git.io/vvvgp)
gulp.task('gh-pages', gulp.series('deploy', function(cb) {
  return del([
    'dist/**/*.gz',
    'dist/**/*.map',
    '!dist'
  ], fs.writeFile('dist/CNAME','new.modernizr.com', cb));
}));

gulp.task('default', gulp.series('deploy'));
