'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DOM = React.DOM, svg = DOM.svg, circle = DOM.circle, path = DOM.path;

var SVGToggle = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var className = this.props.className + ' toggle';

    return svg({width: 0, height: 0, viewBox: '0 0 200 200', className: className},
        circle({cx: 100, cy: 100, r: 80}),
        path({className: "h", d: "M50 100h100"}),
        path({className: "v", d: "M100 50v100"})
      );
  }
});

module.exports = SVGToggle;
