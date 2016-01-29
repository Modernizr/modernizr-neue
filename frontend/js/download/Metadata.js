'use strict';
var _ = require('lodash');
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var MetadataDocs = React.createFactory(require('./MetadataDocs'));
var MetadataList = React.createFactory(require('./MetadataList'));
var MetadataNotes = React.createFactory(require('./MetadataNotes'));
var MetadataPolyfills = React.createFactory(require('./MetadataPolyfills'));
var util = require('./util');

var listify = util.listify;
var DOM = React.DOM, div = DOM.div, span = DOM.span,
  p = DOM.p, code = DOM.code, a = DOM.a;

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

    if (property instanceof Array)
        property = property.join(', ');

    return (
      div({className: 'metadataColumn column'},
        div({className: 'name box ' + (authors.length ? 'hasAuthors' : '')},
          span({className: 'heading'}, name),
          (!_.isEmpty(authors) && div({className: 'subheading'}, 'By: ' + listify(authors)))
        ),
        (async && div({className: 'box metadata-async'}, 'This is an async detect')),
        (docs && MetadataDocs({docs: docs})),
        div({className: 'name box'},
          div({className: 'heading-small'}, 'Usage'),
          div({className: 'propertyname'},
            p(null, code(null, property)),
            p(null, a({
              onClick: function(e) {
                e.preventDefault();
                this.props.onViewExamplesClick();
              }.bind(this)
            }, 'View examples'))
          )
        ),
        (!_.isEmpty(polyfills) && MetadataPolyfills({polyfills: polyfills})),
        (!_.isEmpty(warnings) && MetadataList({keyBase: name + '-warning-', str: 'warning', items: warnings})),
        (!_.isEmpty(knownBugs) && MetadataList({keyBase: name + '-bug-', str: 'known bug', items: knownBugs})),
        (!_.isEmpty(notes) && MetadataNotes({notes: notes}))
      )
    );
  }
});

module.exports = Metadata;
