'use strict';
var React = require('react');
var Fuse = require('fuse.js');
var DOM = React.DOM, div = DOM.div, input = DOM.input, label = DOM.label, button = DOM.button;
var fuseOptions = {
  caseSensitive: false,
  threshold: 0.3,
  keys: ['name','property', 'caniuse', 'cssclass', 'tags', 'aliases', 'builderAliases']
};

var SearchHeader = React.createClass({
  getInitialState: function() {
    return {fuse: new Fuse(this.props.detects, fuseOptions)};
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
          value: this.props.defaultValue
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
    var val = this.refs.search.getDOMNode().value;
    this.props.onChange(this.state.fuse.search(val), val);
  },

  preventSubmit: function(e) {
    if (e.which === 13) {
      e.preventDefault();
      this.props.focusFirst();
    }
  },

  click: function(e) {
    var props = this.props;
    props.build(true);
    props.toggleOverlay(true);
    e.preventDefault();
  }
});

module.exports = SearchHeader;
