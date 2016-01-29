'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DOM = React.DOM, div = DOM.div;
var MetadataDocs = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var docs = this.props.docs || '';

    return (
      div({className: 'box'},
        div({className: 'heading-small'}, 'Description'),
        div({dangerouslySetInnerHTML: {__html: docs}})
      )
    );
  }
});

module.exports = MetadataDocs;
