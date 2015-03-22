'use strict';
var React = require('react/dist/react.min');
var DetectList = require('./DetectList');
var LeftColumn = require('./LeftColumn');
var SearchHeader = require('./SearchHeader');
var DownloadOverlay = require('./DownloadOverlay');
var inBrowser = typeof window !== 'undefined';

var DOM = React.DOM, form = DOM.form;

var DownloadUI = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    if (location.hash.length || location.search.length) {
      var self = this;
      var str = location.hash || location.search;
      var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
      var query = str.replace('#', '?');
      var queries = _.chain(query.replace(/^\?/, '').split('&'))
        .map(function(query) {
          return query.split('-');
        })
        .flatten()
        .value();

      if (queries.length) {
        queries.map(function(query) {
          var searchResult = query.match(/q=(.*)/);
          if (searchResult) {
            self.setState({currentSearch: searchResult[1]});
          } else {
            var matches = function(obj) {
              var prop = obj.property;
              if (_.isArray(prop)) {
                prop = prop.join('_');
              }
              if (query === prop.toLowerCase()) {
                obj.selected = true;
                return true;
              }
            };

            return _.some(self.props.options, matches) || _.some(self.props.detects, matches);
          }
        });
        window.history.replaceState({}, '', baseUrl + query);
      }
    }
  },

  render: function() {
    var props = this.props;
    var state = this.state;
    var search = state.currentSearch;
    var allDetects = props.detects;
    var detects = search && search.length ? _.intersection(allDetects, state.filtered) : allDetects;

    return (
      form({onClick: this.onClick, method: 'POST', action: state.action, onSubmit: this.resetAction},
           React.createElement(SearchHeader, {
             ref: 'searchHeader',
             onChange: this.onSearch,
             detects: allDetects,
             toggleOverlay: this.toggleOverlay,
             onHover: this.build,
             build: this.build,
             defaultValue: state.currentSearch,
             focusFirst: this.focusFirst,
           }),

           (state.overlayOpen && React.createElement(DownloadOverlay, {
             toggle: this.toggleOverlay,
             buildContent: state.build,
             config: state.buildConfig,
             updateAction: this.updateAction
           })),

           React.createElement(LeftColumn, {
             detects: detects,
             allDetects: allDetects,
             toggle: this.toggleAll,
             options: props.options,
             updateURL: this.updateURL,
             updatePrefix: this.updatePrefix
           }),

           React.createElement(DetectList, {
             ref: 'detectList',
             detects: detects,
             select: this.select
           })
          )
    );
  },

  focusFirst: function() {
    debugger;
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
    var classPrefix = state.classPrefix;
    var currentSearch = state.currentSearch || '';
    var setClasses = classPrefix && classPrefix !== '';
    var searchState = currentSearch.length ? 'q=' + currentSearch : '';
    var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');

    // Config uses amdPaths, but build hash uses property names
    var props = this.props.detects.filter(function(detect) {
      return detect.selected;
    }).map(function(detect) {
      var property = detect && detect.property;
      property = _.isArray(property) ?
        property.join('_').replace('-', '_') :
        property.replace('-', '_');
      return property;
    });

    var opts = this.props.options.filter(function(opt) {
      return opt.selected;
    }).map(function(opt) {
      var prop = opt.property;
      if (prop.indexOf('html5') === 0) {
        prop = prop.replace('html5','');
      }
      return prop.toLowerCase();
    });

    var sortedProps = props.sort();
    var sortedOpts = opts.sort();

    var buildQuery = sortedProps.concat(sortedOpts).join('-') +
        ( (setClasses && classPrefix) ?
          '-cssclassprefix:' + classPrefix : '' );

    buildQuery = buildQuery ? '?' + buildQuery : '';

    if (searchState) {
      buildQuery = buildQuery ? buildQuery + '&' + searchState : '?' + searchState;
    }

    inBrowser && window.history.replaceState({}, '', baseUrl + buildQuery);
    return buildQuery;
  },

  select: function(data) {
    data.selected = !data.selected;
    this.setState();
  },

  onSearch: function(results, search) {
    this.setState({filtered: results, currentSearch: search});
  },

  toggleAll: function() {
    var self = this;
    var state = this.state || {};
    var filtered = state.filtered;
    var toggeledState = !state.toggled;
    var detects = filtered && filtered.length ? filtered : this.props.detects;

    _.forEach(detects, function(detect) {
      detect.selected = !toggeledState;
      self.select(detect);
    });

    this.setState({toggled: toggeledState});
  },

  build: function(immediate) {
    var self = this;
    var props = this.props;
    var state = this.state;
    var build = function() {
      var classPrefix = state.classPrefix;
      var detects = _.chain(props.detects)
        .filter(function(detect) {
          return detect.selected;
        }).map(function(detect) {
          return detect.amdPath;
        }).value();

      var options = _.chain(props.options)
        .filter(function(option) {
          return option.selected;
        }).map(function(option) {
          return option.property;
        });

      var allEmpty = !detects.length && !options.length;
      var config = {minify: true, 'classPrefix': classPrefix, 'options': options, 'feature-detects': detects};

      if ((immediate || !allEmpty) && !_.isEqual(config, state.buildConfig)) {
        window.builder(config, function(output) {
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
