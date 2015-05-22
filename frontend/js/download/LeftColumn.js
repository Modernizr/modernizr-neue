'use strict';
var React = require('react/addons');
var PureRenderMixin = React.addons.PureRenderMixin;
var Option = React.createFactory(require('./Option'));
var util = require('./util');
var cx = require('classnames');

var pluralize = util.pluralize;
var DOM = React.DOM, div = DOM.div, button = DOM.button, label = DOM.label, input = DOM.input;

var LeftColumn = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {};
  },

  render: function() {
    var state = this.state;
    var props = this.props;
    var allDetects = props.allDetects;
    var detects = props.detects;
    var options = props.options;
    var select = props.select;

    var totalSelected = allDetects.filter(function(detect) {
      return detect.selected;
    }).length;

    var selected = totalSelected + ' selected';
    var toggled = detects.length === totalSelected;

    var toggle = (toggled ? 'REMOVE' : 'ADD') + ' ALL';
    var className = cx({
      'leftColumn column': true,
      'toggled': toggled
    });
    var inputClass = cx({
      'classPrefix': true,
      'classNameAdded': state.classNameAdded
    });
    var inputContainerClass = cx({
      'hidden': !this.state.showClassPrefixInput
    });
    var results = detects.length === allDetects.length ? ' ' :
      detects.length + pluralize(' result', detects);
    var filesize;
    var text;
    var busy;

    if (props.filesize) {
      if (props.filesize.original) {
        text = props.filesize.original + ' / ' + props.filesize.compressed + ' gzipped';
        busy = false;
      } else {
        text = 'calculating...';
        busy = true;
      }
        filesize = div({className: 'filesizes'},
          text,
          div({
            className: 'screenreader',
            'role' :'status',
            'aria-busy': busy,
            'aria-live': 'polite'
          }, 'Current build size is ' + text)
        );
    }

    options = _.map(options, function(option) {
      var optionClasses = cx({
        'option': true,
        'option-separator': option.group === 'minify'
      });

      return Option({
        className: optionClasses,
        data: option,
        select: select,
        key: option.property,
        name: option.group || 'options',
        selected: option.selected,
        toggleClassPrefix: this.toggleClassPrefix
      });
    }, this);

    return (
      div({className: className, onClick: this.props.onClick},
        div({className: 'box leftColumn-stats'},
          div({className: 'leftColumn-selected', 'aria-live': 'polite', role: 'status'}, selected, results),
          filesize,
          div(null, button({type: 'button', className: 'leftColumn-toggle', onClick: this.props.toggle}, toggle))
        ),
        div({className: 'box heading-small' + (state.optionsToggled ? ' active' : ''), onClick: this.toggleOptions}, 'Options'),
        div({className: 'leftColumn-options'},
          options,
          div({className: inputContainerClass},
            label({htmlFor: 'classPrefix'}, 'className prefix'),
            input({className: inputClass, name: 'classPrefix', id: 'classPrefix', placeholder:'className prefix', onKeyUp: this.classNameAdded})
          )
        )
      )
    );
  },

  componentDidUpdate: function() {
    this.props.updateURL();
    this.props.build();
  },

  toggleOptions: function() {
    this.setState({optionsToggled: !this.state.optionsToggled});
  },

  toggleClassPrefix: function(checked) {
    this.setState({
      showClassPrefixInput: checked
    });
  },

  classNameAdded: function(e) {
    var prefix = e.target.value;
    this.setState({classNameAdded: prefix.length});
    this.props.updatePrefix(prefix);
  }

});

module.exports = LeftColumn;
