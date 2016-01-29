'use strict';
var _ = require('lodash');
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var util = require('./util');
var capitalize = util.capitalize;
var pluralize = util.pluralize;
var DOM = React.DOM, div = DOM.div, ul = DOM.ul, li = DOM.li;

var MetadataList = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var props = this.props;
    var items = props.items || [];
    var str = props.str;

    items = _.map(items, function(item, index) {
      return li({
        key: props.keyBase + index
      }, item);
    });

    return (
      div({className: 'box'},
        div({className: 'heading-small'}, capitalize(pluralize(str, items.length))),
        ul(null, items)
      )
    );
  }
});

module.exports = MetadataList;
