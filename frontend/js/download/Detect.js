'use strict';
var React = require('react');
var Option = React.createFactory(require('./Option'));

var DOM = React.DOM, li = DOM.li;
var Detect = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    var props = this.props;
    var data = props.data;
    var select = props.select;
    var className = 'detectRow' + (props.expanded === this ? ' expanded' : '');

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
          select: select,
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

  keyDown: function(e) {
    this.props.keyDown(e, this);
  },

  focus: function() {
    this.props.toggle(this);
  },

  mouseDown: function(e) {
    var metadataPane = this.refs.option.refs.metadata.getDOMNode();
     if (metadataPane.contains(e.target) && !this.state.clickFocused) {
      this.setState({clickFocused: true});
    }
  },

  click: function(e) {
    var triggeredByKeyboard = (e.clientX === e.clientY && e.clientX === 0);
    if (triggeredByKeyboard) {
      this.props.select(this.props.data);
    } else if (this.state.clickFocused) {
      this.setState({clickFocused: false});
      this.refs.option.refs.input.getDOMNode().focus();
      e.stopPropagation();
    }
  },

  blur: function(e) {
    if (!e) {
      return;
    }
    var self = this;
    var detectElem = this.getDOMNode();
    var blurredElem = e.target;
    var clickFocused =  this.state.clickFocused;
    var focusedElem;


    // blur is a bucket of pain, because there is no cross browser way to get the
    // newly focused target that is the result of a blur. Firefox does not support
    // focusin/out, so we can't use that. It also does not properly update
    // `explicitOriginalTarget` for delegated blur events. Nor does it support
    // the `relatedTarget (along with IE11). Chrome does not update
    // `document.activeElement` until after the `focus` event, so we `defer` until
    // then, and there we have it.
    _.defer(function() {
      focusedElem = document.activeElement;
      if (blurredElem.type !== 'checkbox' && focusedElem === document.body) {
        // if we are focused on the info pane, and cause a blur by clicking,
        // refocus the detect in the list
        return self.refs.option.refs.input.getDOMNode().focus();
      }
      if (!detectElem.contains(focusedElem) && !clickFocused) {
        self.props.toggle();
      }
    });
  }
});

module.exports = Detect;
