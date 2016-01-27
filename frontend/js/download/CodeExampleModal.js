'use strict';
var React = require('react/addons');
var DOM = React.DOM, div = DOM.div, span = DOM.span, pre = DOM.pre;

var CodeExampleModal = React.createClass({
  render: function() {
    var data = this.props.data;

    return div({
      onClick: function() {
        this.props.onRequestClose();
      }.bind(this),
      style: {
        position: 'fixed',
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 2,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      div({
        onClick: function(e) {
          e.stopPropagation();
        }.bind(this),
        style: {
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
          padding: 20,
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: 500,
          overflow: 'auto',
          lineHeight: '1.5em'
        }
      },
        span({style: {opacity: 0.5}}, 'CSS'),
        pre({style: {overflow: 'visible'}},
          '.no-' + data.property + ' .box { color: red; }\n' +
          '.' + data.property + ' .box { color: green; }\n'
        ),
        span({style: {opacity: 0.5}}, 'JS'),
        pre({style: {overflow: 'visible'}},
          (data.async ? 'Modernizr.on(\'' + data.property + '\', function (result) {\n' : '') +
          'if (' + (data.async ? 'result' : ('Modernizr.' + data.property)) + ') {\n' +
          '// supported\n' +
          '} else {\n' +
          '  // not-supported\n' +
          '}\n' +
          (data.async ? '});' : '')
        )
      )
    )
  }
});

module.exports = CodeExampleModal;
