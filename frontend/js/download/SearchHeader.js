/*globals ga */
'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Fuse = require('fuse.js');
var DOM = React.DOM, div = DOM.div, input = DOM.input, label = DOM.label, button = DOM.button;
var fuseOptions = {
  caseSensitive: false,
  threshold: 0.3,
  keys: ['name','property', 'caniuse', 'cssclass', 'tags', 'aliases', 'builderAliases'],
  maxPatternLength: 32
};
var fuse;

var SearchHeader = React.createClass({
  mixins: [PureRenderMixin],

  componentDidMount: function() {
    fuse = new Fuse(this.props.detects, fuseOptions);
  },

  render: function() {
    return (
      div({className:'header-search'},
        label({ className:'hidden', htmlFor: 'header-search-input'}, 'Type a browser feature'),
        input({
          ref: 'search',
          role: 'search',
          className:'header-search-input',
          placeholder: 'Type a browser feature',
          onChange: this.change,
          id: 'header-search-input',
          onKeyDown: this.preventSubmit,
          value: this.props.defaultValue,
          maxLength: fuseOptions.maxPatternLength
        }),
        button({type: 'submit',
          className: 'header-search-build',
          onClick: this.click,
          onMouseOver: this.props.onHover,
          'aria-haspopup': true
        }, 'Build')
      )
    );
  },

  change: function() {
    var val = this.refs.search.value;
    this.props.onChange(fuse.search(val), val);
  },

  preventSubmit: function(e) {
    if (e.which === 13) {
      e.preventDefault();
      this.props.focusFirst();
    }
  },

  click: function(e) {
    var props = this.props;
    // Track builds at click on Build button
    if ( window.ga ) {
      ga('send', 'pageview', '/build/' + location.search.substr(1).replace(/-/g, '^'));
    }
    props.build(true);
    props.toggleOverlay(true);
    e.preventDefault();
  }
});

module.exports = SearchHeader;
