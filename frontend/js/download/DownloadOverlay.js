/*globals Modernizr*/
'use strict';
var React = require('react/dist/react.min');
var DownloadOverlayOption = React.createFactory(require('./DownloadOverlayOption'));
var gruntify = require('./util').gruntify;
var DOM = React.DOM, div = DOM.div, ul = DOM.ul;

var DownloadOverlay = React.createClass({
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
            filename: 'modernizr-custom',
            updateAction: props.updateAction
          }),
          DownloadOverlayOption({
            title: 'Command Line Config',
            expanded: state.expanded,
            content: JSON.stringify(config, 0, 2),
            toggleTextarea: this.toggleTextarea,
            hasFlash: hasFlash,
            type: 'application/json',
            filename: 'modernizr-config',
            path: '/download/config',
            updateAction: props.updateAction
          }),
          DownloadOverlayOption({
            title: 'Grunt Config',
            expanded: state.expanded,
            content: gruntify(config),
            toggleTextarea: this.toggleTextarea,
            hasFlash: hasFlash,
            type: 'application/json',
            filename: 'grunt config',
            path: '/download/gruntconfig',
            updateAction: props.updateAction
          })
        )
      )
    );
  },

  toggleOverlay: function(e) {
    var container = this.refs.container.getDOMNode();
    if (!container.contains(e.target)) {
      this.props.toggle(false);
    }
  }
});

module.exports = DownloadOverlay;
