'use strict';
var React = require('react/addons');
var PureRenderMixin = React.addons.PureRenderMixin;
var Option = React.createFactory(require('./Option'));
var cx = require('classnames');

var DOM = React.DOM, li = DOM.li;
var Detect = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {};
  },

  render: function() {
    var props = this.props;
    var data = props.data;
    var className = cx({
      'detectRow': true,
      'expanded': props.expanded
    });

    return (
      li({
          className: className,
          onFocus: this.focus,
          onBlur: this.blur,
          onMouseDown: this.mouseDown,
          onKeyDown: this.keyDown,
          onClick: this.click
        },
        Option({
          toggle: props.toggle,
          ref: 'option',
          className: 'option detect',
          select: props.select,
          data: data,
          name: 'feature-detects',
          focusParent: this.focus,
          blurParent: this.blur,
          metaData: {data: data},
          ignoreLabelClick: true
        })
      )
    );
  },

  componentDidUpdate: function() {
    if (this.props.expanded) {
      var HEADER_HEIGHT = 120;

      var windowHeight = window.innerHeight;
      var windowTop = window.pageYOffset;
      var windowBottom = windowTop + windowHeight;

      var node = this.getDOMNode();
      var nodeTop = node.offsetTop;
      var nodeBottom = nodeTop + node.offsetHeight;
      var offset;

      if (nodeTop < windowTop + HEADER_HEIGHT) {
        offset = nodeTop - HEADER_HEIGHT - 10;
      } else if (nodeBottom > windowBottom) {
        offset = nodeBottom - windowHeight + 10;
      }

      window.scrollTo(0, offset);
    }
  },

  keyDown: function(e) {
    this.props.keyDown(e, this.props.index);
  },

  focus: function() {
    var props = this.props;
    props.focus(props.data.property);
  },

  mouseDown: function(e) {
    var metadataPane = this.refs.option.refs.metadata.getDOMNode();
     if (metadataPane.contains(e.target) && !this.state.clickFocused) {
      this.setState({clickFocused: true});
    }
  },

  blur: function(e) {
    if (this.state.clickFocused) {
      this.setState({clickFocused: false});
      this.refs.option.refs.input.getDOMNode().focus();
      return e.preventDefault();
    }

    var props = this.props;
    props.blur(props.data.property);
  }
});

module.exports = Detect;
