'use strict';
var React = require('react/dist/react.min');
var MetadataDocs = require('./MetadataDocs');
var MetadataList = require('./MetadataList');
var MetadataNotes = require('./MetadataNotes');
var MetadataPolyfills = require('./MetadataPolyfills');
var util = require('./util');

var listify = util.listify;
var DOM = React.DOM, div = DOM.div, span = DOM.span;

var Metadata = React.createClass({
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


    return (
      div({className: 'metadataColumn column'},
        div({className: 'name box ' + (authors.length ? 'hasAuthors' : '')},
          span({className: 'heading'}, name),
          (!_.isEmpty(authors) && div({className: 'subheading'}, 'By: ' + listify(authors)))
        ),
        (async && div({className: 'box metadata-async'}, 'This is an async detect')),
        (docs && React.createElement(MetadataDocs, {docs: docs})),
        (!_.isEmpty(polyfills) && React.createElement(MetadataPolyfills, {polyfills: polyfills})),
        (!_.isEmpty(warnings) && React.createElement(MetadataList, {warnings: warnings})),
        (!_.isEmpty(knownBugs) && React.createElement(MetadataList, {knownBugs: knownBugs})),
        (!_.isEmpty(notes) && React.createElement(MetadataNotes, {notes: notes}))
      )
    );
  }
});

module.exports = Metadata;
