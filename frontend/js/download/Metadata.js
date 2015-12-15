'use strict';
var React = require('react/addons');
var PureRenderMixin = React.addons.PureRenderMixin;
var MetadataDocs = React.createFactory(require('./MetadataDocs'));
var MetadataList = React.createFactory(require('./MetadataList'));
var MetadataNotes = React.createFactory(require('./MetadataNotes'));
var MetadataPolyfills = React.createFactory(require('./MetadataPolyfills'));
var util = require('./util');

var listify = util.listify;
var DOM = React.DOM, div = DOM.div, span = DOM.span;

var Metadata = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    var data = this.props.data;
    var async = data.async;
    var authors = data.authors;
    var docs = data.doc;
    var knownBugs = data.knownBugs;
    var name = data.name;
    var notes = data.notes;
    var polyfills = data.polyfills;
    var warnings = data.warnings;
    var property = data.property;


    return (
      div({className: 'metadataColumn column'},
        div({className: 'name box ' + (authors.length ? 'hasAuthors' : '')},
          span({className: 'heading'}, name),
          (!_.isEmpty(authors) && div({className: 'subheading'}, 'By: ' + listify(authors))),
          div({className: 'propertyname', dangerouslySetInnerHTML: {__html: '<code>' + property + '</code>'}})
        ),
        (async && div({className: 'box metadata-async'}, 'This is an async detect')),
        (docs && MetadataDocs({docs: docs})),
        (!_.isEmpty(polyfills) && MetadataPolyfills({polyfills: polyfills})),
        (!_.isEmpty(warnings) && MetadataList({keyBase: name + '-warning-', str: 'warning', items: warnings})),
        (!_.isEmpty(knownBugs) && MetadataList({keyBase: name + '-bug-', str: 'known bug', items: knownBugs})),
        (!_.isEmpty(notes) && MetadataNotes({notes: notes}))
      )
    );
  }
});

module.exports = Metadata;
