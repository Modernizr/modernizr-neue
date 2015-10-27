'use strict';

// We have three possible outcomes when someone requests `/download`,

// 1. serve the compilled, static html file if in production
// 2. serve a compiled handlebars template on each request, in development
// 3. reply with a tar ball of a compiled version of Modernizr, if requested via bower

// this module determines the right one depending the circumstances

var Path = require('path');
var ETag = require('etag');
var Archiver = require('archiver');
var Modernizr = require('modernizr');
var modernizrMetadata = Modernizr.metadata();
var bowerJSON = require('../util/bowerJSON')();
var modernizrOptions = require('../util/modernizrOptions');
var _ = require(Path.join(__dirname, '..', '..', 'frontend', 'js', 'lodash.custom'));

// the `builderContent` step is super heavy, as a result, do not load it if we
// are in a production enviroment
if (process.env.NODE_ENV !== 'production') {
  var builderContent = require('../buildSteps/download');

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
    team: require('../util/footer')
  };
}

var propToAMD = function(prop) {
  if (_.contains(prop, '_')) {
    prop = prop.split('_');
  }

  return _.where(modernizrMetadata, {'property': prop})[0].amdPath;
};

var optProp = function(prop) {
  return _.chain(modernizrOptions)
    .filter(function(opt) {
      return opt.property.toLowerCase() === prop;
    })
    .map(function(opt) {
      return opt.property;
    })
    .first()
    .value();
};

// takes a build hash/querystring that is updated automatically on `/download`, and
// included by default inside of every custom build of modernizr, and converts it
// into a valid Modernizr config
var config = function(query) {

  var config = {
    'minify': true,
    'feature-detects': [],
    'options': []
  };

  var queries = _.chain(query.replace(/^\?/, '').split('&'))
    .map(function(query) {
      return query.split('-');
    })
    .flatten()
    .value();

  queries.forEach(function(query) {
    // `/download` has a search box that we track state with via the `q` param
    // since it defently won't match anything, we exit early when found
    var searchResult = query.match(/q=(.*)/);
    var cssclassprefix = query.match('cssclassprefix:(.*)');

    if (searchResult) {
      return;
    }

    if (cssclassprefix) {
      // the classPrefix is tracked separately from other options, so just update
      // the config accordingly, and return false for every property we match against
      config.classPrefix = cssclassprefix[1];
      return;
    }

    if (query.match('shiv$')) {
      // `html5shiv` and `html5printshiv` are configured as `shiv` and `printshiv`
      // for the sake of brevity, as well as to drive me insane
      query = 'html5' + query;
    }

    var matches = function(obj) {
      var prop = obj.property;

      if (_.isArray(prop)) {
        // some detects have an array of properties, which would strinigfy weirdly
        // without us doing it manually here
        prop = prop.join('_');
      }

      if (query === 'dontmin' && prop === 'minify') {
        // we track the minify state on the `/download` side under the inverted
        // `dontmin` option, and on the server side with the (non standard)
        // `modernizr.options().minify` option
        config.minify = false;
      }

      return query === prop.toLowerCase();
    };

    if (_.some(modernizrOptions, matches)) {
      config.options.push(optProp(query));
    } else if (_.some(modernizrMetadata, matches)) {
      config['feature-detects'].push(propToAMD(query));
    }
  });

  return config;
};

var handler = function (request, reply) {
  // the download urls (that include the build settings) can be used inside of a bower.json
  // file to automatically download a custom version of the current version of Modernizr
  // Ironically, in order to support this, we have to do user agent sniffing
  var ua = request.headers['user-agent'];
  // http://bower.io/docs/config/#user-agent
  // NOTE this will obvs fail to match for custom bower user agents
  var isBower = !!ua.match(/^node\/v\d*\.\d*\.\d* (darwin|freebsd|linux|sunos|win32) (arm|ia32|x64)/);

  if (isBower) {
    // bower complains a bunch if we don't include proper metadata with the response.
    // in order to do so, we create a virtual tar file, and but the build and bower.json
    // file in it
    var archive = Archiver('tar');
    var query = request.url.search.replace(/\.tar(\.gz)?|zip$/, '');
    var buildConfig = config(query);

    Modernizr.build(buildConfig, function(build) {
      var module = archive
        .append(build, {name: 'bowerJSON.main'})
        .append(JSON.stringify(bowerJSON, 0, 2), {name: 'bower.json'})
        .finalize();

      reply(module)
        // bower bases how it handles the response on the name of the responded file.
        // we have to reply with a `.tar` file in order to be processed correctly
        .header('Content-disposition', 'attachment; filename=Modernizr.custom.tar')
        // bower will cache files downloaded via URLResolver (which is what it is
        // using here) via its ETag. This won't prevent us from building a new
        // version on each response, but it will prevent wasted bandwidth
        .etag(ETag(bowerJSON.version + JSON.stringify(buildConfig)));
    });

  } else if (!!ua.match(/^npm\//)) {

    Modernizr.build(buildConfig, function(build) {
    var archive = Archiver('tar');
    var query = request.url.search.replace(/\.tar(.gz)?$/, '');
    var buildConfig = config(query);
      var module = archive
        .append(build, {name: 'modernizr/' + bowerJSON.main})
        .append(JSON.stringify(bowerJSON, 0, 2), {name: 'modernizr/package.json'})
        .finalize();

      reply(module)
        .header('Content-disposition', 'attachment; filename=Modernizr.custom.tar')
        .etag(ETag(bowerJSON.version + JSON.stringify(buildConfig)));
    });
  } else if (process.env.NODE_ENV !== 'production') {
    // if it was not requested by bower, and not in prod mode, we serve the
    // homepage via the Hapi handlebars renderer
    reply.view('pages/download', downloaderConfig);
  } else {
    // if all else fails, we are in prod/static mode, so serve the static index
    reply.file(Path.join(__dirname, '..', '..', 'dist', 'download', 'index.html'));
  }
};

module.exports = handler;
