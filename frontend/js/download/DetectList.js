'use strict';
var React = require('react/dist/react.min');
var Detect = React.createFactory(require('./Detect'));
var DOM = React.DOM, ul = DOM.ul, li = DOM.li;
var DetectList = React.createClass({

  getInitialState: function() {
    return {};
  },

  onKeyDown: function(e, currentDetect) {
    var currentRef = currentDetect.props._ref;
    var charCode = e.which;
    //              up arrow || J
    var UP = charCode === 38 || charCode === 75;
    //              down arrow || K
    var DOWN = charCode === 40 || charCode === 74;

    if (UP || DOWN) {
      var offset = UP ? -1 : 1;
      var nextRef = Math.max(0, Math.min(currentRef + offset, this.props.detects.length));
      if (nextRef !== currentRef) {
        this.refs[nextRef].refs.option.refs.input.getDOMNode().focus();
      }
      e.preventDefault();
    }
  },

  toggleDetect: function(elem) {
    this.setState({expanded: elem});
  },

  render: function() {
    var detects = this.props.detects;
    var select = this.props.select;
    var self = this;

    detects = _.map(detects, function(detect, i) {
      return Detect({
        expanded: self.state.expanded,
        toggle: self.toggleDetect,
        ref: i,
        _ref: i,
        key: detect.property,
        data: detect,
        select: select,
        keyDown: self.onKeyDown
      }, detect.name);
    });

    detects = detects.length ? detects : li({className: 'detect option none'}, ':[ no such luck...');

    return ul({className: 'detects'}, detects);
  }
});

module.exports = DetectList;
