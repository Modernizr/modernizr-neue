'use strict';
var _ = require('lodash');
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DOM = React.DOM, div = DOM.div, a = DOM.a;
var MetadataNotes = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var notes = this.props.notes || [];
    var caniuse = this.props.caniuse;

    notes = _.map(notes, function(note) {
      return a({
        href: note.href,
        key: note.name,
        className: 'metadata-detailsLink'
      }, note.name);
    });

    return (
      div({className: 'box'},
        div({className: 'heading-small'}, 'More Details'),
        div(null, notes),
        caniuse && a({href: 'http://caniuse.com/#search=' + caniuse}, 'caniuse browser support')
      )
    );
  }
});

module.exports = MetadataNotes;
