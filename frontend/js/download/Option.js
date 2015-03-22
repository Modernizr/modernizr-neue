'use strict';
var React = require('react/dist/react.min');
var SVGToggle = require('./SVGToggle');
var Metadata = require('./Metadata');
var DOM = React.DOM, span = DOM.span, input = DOM.input, label = DOM.label;

var Option = React.createClass({

  render: function() {
    var props = this.props;
    var data = props.data;
    var value = data.amdPath || data.property;
    var prop = data.property;
    var name = data.name;

    return (
      span({className: props.className, onClick: this.click},
        input({
          ref: 'input',
          type: 'checkbox',
          name: props.name,
          id: prop,
          className: 'option-checkbox',
          value: value,
          checked: data.selected
        }),
        label({ref: 'label', title: name, className: 'option-label', htmlFor: prop}, name,
          React.createElement(SVGToggle, {ref: 'SVGToggle', className: 'detectToggle'})
        ),
        (props.metaData && React.createElement(Metadata, {ref: 'metadata', data: data}))
      )
    );
  },

  click: function(e) {
    var target = e.target;
    var props = this.props;
    var toggle = this.refs.SVGToggle.getDOMNode();
    var label = this.refs.label.getDOMNode();
    var triggeredByKeyboard = (e.clientX === e.clientY && e.clientX === 0);
    var clickedToggle = (toggle === target || toggle.contains(target));

    if (!triggeredByKeyboard && target === label) {
      props.focusParent && props.focusParent();
      e.preventDefault();
    } else if (triggeredByKeyboard || clickedToggle) {
      props.select(props.data);
      e.stopPropagation();
    }

  }
});

module.exports = Option;
