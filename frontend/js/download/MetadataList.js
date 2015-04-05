'use strict';
var React = require('react');
var util = require('./util');
var pluralize = util.pluralize;
var DOM = React.DOM, div = DOM.div, ul = DOM.ul, li = DOM.li;

var MetadataList = React.createClass({
  render: function() {
    var items = this.props.items || [];
    var str = this.props.str;

    items = _.map(items, function(item) {
      return li(null, item);
    });

    return (
      div({className: 'box'},
        div(null, pluralize(str, items.length)),
        ul(null, items)
      )
    );
  }
});

module.exports = MetadataList;
