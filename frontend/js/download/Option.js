'use strict';
var React = require('react/addons');
var PureRenderMixin = React.addons.PureRenderMixin;
var SVGToggle = React.createFactory(require('./SVGToggle'));
var Metadata = React.createFactory(require('./Metadata'));
var DOM = React.DOM, span = DOM.span, input = DOM.input, label = DOM.label;

var Option = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var props = this.props;
    var data = props.data;
    var value = data.amdPath || data.property;
    var prop = data.property;
    var name = data.name;

    return (
      span({className: props.className},
        input({
          ref: 'input',
          type: 'checkbox',
          name: props.name,
          id: prop,
          className: 'option-checkbox',
          value: value,
          checked: data.selected,
          onChange: this.change,
          onKeyDown: this.keyDown
        }),
        label({
          ref: 'label',
          title: name,
          className: 'option-label',
          htmlFor: prop,
          onClick: this.click
        }, name,
          SVGToggle({ref: 'SVGToggle', className: 'detectToggle'})
        ),
        (props.metaData && Metadata({ref: 'metadata', data: data}))
      )
    );
  },

  componentDidMount: function() {
    this.triggerClassPrefixCallback(this.props.data);
  },

  keyDown: function(e) {
    if (e.which === 13) {
      var input = this.refs.input.getDOMNode();
      input.checked = !input.checked;
      this.change();
      e.preventDefault();
    }
  },

  click: function(e) {
    var props = this.props;
    var toggle = this.refs.SVGToggle.getDOMNode();

    if (props.ignoreLabelClick && !toggle.contains(e.target)) {
      e.preventDefault();
    }

    if (props.focusParent) {
      props.focusParent(props.name);
    }
  },

  triggerClassPrefixCallback: function(data) {
    if(data.property === 'setClasses') {
      this.props.toggleClassPrefix(data.selected);
    }
  },

  change: function() {
    var props = this.props;
    props.select(props.data);

    this.triggerClassPrefixCallback(this.props.data);
  }
});

module.exports = Option;
