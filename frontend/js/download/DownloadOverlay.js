'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DownloadOverlayOption = React.createFactory(require('./DownloadOverlayOption'));
var gruntify = require('./util').gruntify;
var DOM = React.DOM, div = DOM.div, form = DOM.form, button = DOM.button, input = DOM.input, ul = DOM.ul, li = DOM.li;

var DownloadOverlay = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {};
  },

  toggleTextarea: function(elem) {
    this.setState({expanded: elem});
  },

  render: function() {
    var props = this.props;
    var state = this.state;
    var config = props.config;
    var hasFlash = Modernizr.flash && !Modernizr.flash.blocked;
    var codepen = this.buildCodePen();

    return div({className: 'downloadOverlay', onClick: this.toggleOverlay},
      div({ref: 'container', className: 'downloadOverlay-container'},
        ul({className: 'downloadOverlay-options'},
          DownloadOverlayOption({
            title: 'Build',
            expanded: state.expanded,
            content: props.buildContent,
            toggleTextarea: this.toggleTextarea,
            hasFlash: hasFlash,
            type: 'text/javascript',
            filename: 'modernizr-custom.js',
            updateAction: props.updateAction,
            key: 'build'
          }),
          DownloadOverlayOption({
            title: 'Command Line Config',
            expanded: state.expanded,
            content: JSON.stringify(config, 0, 2),
            toggleTextarea: this.toggleTextarea,
            hasFlash: hasFlash,
            type: 'application/json',
            filename: 'modernizr-config.json',
            path: '/download/config',
            updateAction: props.updateAction,
            key: 'config'
          }),
          DownloadOverlayOption({
            title: 'Grunt Config',
            expanded: state.expanded,
            content: gruntify(config, props.allDetects),
            toggleTextarea: this.toggleTextarea,
            hasFlash: hasFlash,
            type: 'application/json',
            filename: 'grunt-config.json',
            path: '/download/gruntconfig',
            updateAction: props.updateAction,
            key: 'grunt'
          }),
          li({
            key: 'codepen'
          },
            form({
              action: 'https://codepen.io/pen/define',
              method: 'POST'
            },
              input({
                type: 'hidden',
                name: 'data',
                value: codepen
              }),
              button({className: 'fakelink'}, 'Open build on codepen.io')
            )
          )
        )
      )
    );
  },

  toggleOverlay: function(e) {
    if (!this.refs.container.contains(e.target)) {
      this.props.toggle(false);
    }
  },

  buildCodePen: function() {
    var data = {
      title: 'modernizr.custom.js',
      description: 'This is generated via modernizr.com/download',
      html: '<h1>Modernizr build auto generated</h1><p><a href="' + location.href + '">Build hash</a></p>',
      css: 'ul{-webkit-column-count: 3;-moz-column-count: 3;column-count: 3;}li{color:green}',
      js: this.props.buildContent
    };

    // multiclasses features are joined with a _, so we do this splitting and joining
    // to flatten the array into a list of individual classes
    var features = location.search.slice(1).split('&')[0].split('_').join('-').split('-');
    var _ul = document.createElement('ul');

    _.forEach(features, function(feature) {
      data.css += '.no-' + feature + ' li.'+ feature + '{ color: red; }';

      var _li = document.createElement('li');
      _li.className = _li.innerHTML = feature;

      _ul.appendChild(_li);
    });

    data.html = _ul.outerHTML;

    return JSON.stringify(data);
  }
});

module.exports = DownloadOverlay;
