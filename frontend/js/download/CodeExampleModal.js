'use strict';
var React = require('react');
var DOM = React.DOM, div = DOM.div, span = DOM.span, pre = DOM.pre;

var CodeExampleModal = React.createClass({
  render: function() {
    var data = this.props.data;

    return div({
      className: 'modal',
      onClick: function() {
        this.props.onRequestClose();
      }.bind(this)
    },
      div({
        className: 'modal-inner',
        onClick: function(e) {
          e.stopPropagation();
        }.bind(this)
      },
        span({className: 'note'}, 'CSS'),
        pre({className: 'codeblock', dangerouslySetInnerHTML: {__html:
          '<span class="pl-e">.no-' + data.property + ' .box</span> { <span class="pl-c1">color: red;</span> }\n' +
          '<span class="pl-e">.' + data.property + ' .box</span> { <span class="pl-c1">color: green;</span> }\n'
        }}),
        span({className: 'note'}, 'JS'),
        pre({className: 'codeblock', dangerouslySetInnerHTML: {__html:
          (data.async ? '<span class="pl-smi">Modernizr</span>.<span class="pl-en">on</span>(<span class="pl-s">\'' + data.property + '\'</span>, <span class="pl-k">function</span>(<span class="pl-smi">result</span>) {\n' : '') +
          (data.async ? '  ' : '') + '<span class="pl-k">if</span> (' + (data.async ? 'result' : ('Modernizr.<span class="pl-c1">' + data.property + '</span>')) + ') {\n' +
          (data.async ? '  ' : '') + '  <span class="pl-c">// supported</span>\n' +
          (data.async ? '  ' : '') + '} <span class="pl-k">else</span> {\n' +
          (data.async ? '  ' : '') + '  <span class="pl-c">// not-supported</span>\n' +
          (data.async ? '  ' : '') + '}\n' +
          (data.async ? '});' : '')
        }})
      )
    );
  }
});

module.exports = CodeExampleModal;
