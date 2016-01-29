'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var SVGToggle = React.createFactory(require('./SVGToggle'));
var Metadata = React.createFactory(require('./Metadata'));
var CodeExampleModal = React.createFactory(require('./CodeExampleModal'));
var DOM = React.DOM, div = DOM.div, input = DOM.input, label = DOM.label;

var Option = React.createClass({

  getInitialState: function() {
    return {
      isExamplesOpen: false
    };
  },

  render: function() {
    var props = this.props;
    var data = props.data;
    var value = data.amdPath || data.property;
    var prop = data.property;
    var name = data.name;

    return (
      div({className: props.className},
        input({
          ref: 'input',
          type: 'checkbox',
          name: props.name,
          id: prop,
          className: 'option-checkbox',
          value: value,
          checked: data.checked,
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
          SVGToggle({
            ref: 'SVGToggle',
            className: 'detectToggle'
          })
        ),
        (props.metaData && Metadata({
          ref: 'metadata',
          data: data,
          onViewExamplesClick: function() {
            this.setState({
              isExamplesOpen: true
            });
          }.bind(this)
        })),
        (props.metaData && this.state.isExamplesOpen && (
          CodeExampleModal({
            data: data,
            onRequestClose: function() {
              this.setState({
                isExamplesOpen: false
              });
            }.bind(this)
          })
        ))
      )
    );
  },

  componentDidMount: function() {
    this.triggerClassPrefixCallback(this.props.data);
  },

  keyDown: function(e) {
    if (e.which === 13) {
      var input = this.refs.input;
      input.checked = !input.checked;
      this.change();
      e.preventDefault();
    }
  },

  click: function(e) {
    var props = this.props;
    var toggle = ReactDOM.findDOMNode(this.refs.SVGToggle);

    if (props.ignoreLabelClick && !toggle.contains(e.target)) {
      e.preventDefault();
    }

    if (props.focusParent) {
      props.focusParent(props.name);
    }
  },

  triggerClassPrefixCallback: function(data) {
    if(data.property === 'setClasses') {
      this.props.toggleClassPrefix(data.checked);
    }
  },

  change: function(e) {
    var props = this.props;
    var data = props.data;
    data.selected = e.target.checked;

    if (props.change) {
      props.change(data);
    } else {
      props.select(data);
    }

    this.triggerClassPrefixCallback(data);
  }
});

module.exports = Option;
