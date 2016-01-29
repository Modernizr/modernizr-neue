'use strict';
var React = require('react');
var DetectList      = React.createFactory(require('./DetectList'));
var LeftColumn      = React.createFactory(require('./LeftColumn'));
var SearchHeader    = React.createFactory(require('./SearchHeader'));
var DownloadOverlay = React.createFactory(require('./DownloadOverlay'));

var DOM = React.DOM, form = DOM.form;

var DownloadUI = React.createClass({
  getInitialState: function() {
    return {
      currentSearch: this.props.currentSearch
    };
  },

  componentDidMount: function() {
    var props = this.props;
    if (props.currentSearch) {
      this.refs.searchHeader.change();
    }

    if (props.shouldBuild) {
      this.build();
    }
  },

  render: function() {
    var props = this.props;
    var state = this.state;
    var search = state.currentSearch;
    var allDetects = props.detects;
    var detects = search && search.length ? _.intersection(allDetects, state.filtered) : allDetects;
    var overlay = state.overlayOpen ?
                  DownloadOverlay({
                    toggle: this.toggleOverlay,
                    buildContent: state.build,
                    config: state.buildConfig,
                    updateAction: this.updateAction,
                    allDetects: allDetects
                  }) :
                  null;

    return (
      form({method: 'POST', action: state.action, onSubmit: this.resetAction},
        SearchHeader({
          ref: 'searchHeader',
          onChange: this.onSearch,
          detects: allDetects,
          toggleOverlay: this.toggleOverlay,
          onHover: this.build,
          build: this.build,
          defaultValue: state.currentSearch,
          focusFirst: this.focusFirst
        }),

        overlay,

        LeftColumn({
          detects: detects,
          allDetects: allDetects,
          options: props.options,
          updateURL: this.updateURL,
          updatePrefix: this.updatePrefix,
          filesize: state.filesize,
          build: this.build,
          select: this.select
        }),

        DetectList({
          ref: 'detectList',
          detects: detects,
          select: this.select,
          currentSearch: search
        })
       )
    );
  },

  focusFirst: function() {
    var topDetect = this.refs.detectList.refs[0];
    if (topDetect) {
      topDetect.refs.option.refs.input.focus();
    }
  },

  updatePrefix: function(prefix) {
    this.setState({classPrefix: prefix});
  },

  componentDidUpdate: function() {
    this.updateURL();
    this.build();
  },

  updateAction: function(url) {
    this.setState({action: url});
  },

  resetAction: function() {
    this.setState({action: null});
  },

  toggleOverlay: function(overlayOpen) {
    this.setState({overlayOpen: overlayOpen});
  },

  updateURL: function() {
    var state = this.state;
    var useHash = localStorage.useHash;
    var seperator = useHash ? '#' : '?';
    var classPrefix = state.classPrefix;
    var currentSearch = state.currentSearch || '';
    var setClasses = classPrefix && classPrefix !== '';
    var searchState = currentSearch.length ? 'q=' + currentSearch : '';
    var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');

    var minify = this.props.options.some(function(opt) {
        return opt.property === 'minify' && opt.checked;
      });

    // Config uses amdPaths, but build hash uses property names
    var props = this.props.detects.filter(function(detect) {
        return detect.checked;
      }).map(function(detect) {
        var property = detect && detect.property;
        property = _.isArray(property) ?
          property.join('_').replace('-', '_') :
          property.replace('-', '_');
        return property;
      });

    var opts = this.props.options.filter(function(opt) {
        return opt.checked && opt.property !== 'minify';
      }).map(function(opt) {
        var prop = opt.property;
        if (prop.indexOf('html5') === 0) {
          prop = prop.replace('html5','');
        }
        return prop.toLowerCase();
      });

    if (!minify) {
      opts.push('dontmin');
    }

    var sortedProps = props.sort();
    var sortedOpts = opts.sort();

    var buildQuery = sortedProps.concat(sortedOpts).join('-') +
        ( (setClasses && classPrefix) ?
          '-cssclassprefix:' + escape(classPrefix) : '' );

    buildQuery = buildQuery ? seperator + buildQuery : '';

    if (searchState) {
      buildQuery = buildQuery ? buildQuery + '&' + searchState : seperator + searchState;
    }

    if (useHash) {
      location.hash = buildQuery;
    } else {
      window.history.replaceState({}, '', baseUrl + buildQuery);
    }
    return buildQuery;
  },

  select: function(data) {
    var state = {};
    data.checked = !data.checked;
    if (this.state.filesize) {
      state = {
        filesize: {}
      };
    }
    this.setState(state);
  },

  onSearch: function(results, search) {
    this.setState({filtered: results, currentSearch: search});
  },

  updateFilesize: function(config) {
    var self = this;

    if ('gziper' in window) {
      window.gziper(config, function(filesize) {
        self.setState({filesize: filesize});
      });
    }
  },

  build: function(immediate) {
    var self = this;
    var props = this.props;
    var state = this.state;
    var build = function() {
      var minify = false;
      var classPrefix = state.classPrefix;
      var detects = _.chain(props.detects)
        .filter(function(detect) {
          return detect.checked;
        }).map(function(detect) {
          return detect.amdPath;
        }).value();

      var options = _.chain(props.options)
        .filter(function(option) {
          if (option.name === 'minify' && option.checked) {
            minify = true;
            return;
          }
          return option.checked;
        }).map(function(option) {
          return option.property;
        }).value();

      var allEmpty = !detects.length && !options.length;
      var config = {minify: minify, 'classPrefix': classPrefix, 'options': options, 'feature-detects': detects};

      if ((!allEmpty || state.buildConfig || immediate) && !_.isEqual(config, state.buildConfig)) {
        window.builder(config, function(output) {
          self.updateFilesize(JSON.stringify({build: output, config: config}));
          self.setState({build: output});
        });
        self.setState({buildConfig: config});
      }

    };

    clearTimeout(this.timeout);
    this.timeout = immediate ? build() : setTimeout(build, 1000);

  }
});

module.exports = DownloadUI;
