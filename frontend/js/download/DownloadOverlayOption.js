/*globals ZeroClipboard, Modernizr*/
'use strict';
var React = require('react/dist/react.min');
var DOM = React.DOM, textarea = DOM.textarea, a = DOM.a, li = DOM.li, label = DOM.label, button = DOM.button, span=DOM.span;

var DownloadOverlayOption = React.createClass({

  getInitialState: function() {
    return {
      supportsDownload: Modernizr.blobconstructor && Modernizr.adownload,
      hasFlash: this.props.hasFlash
    };
  },

  setupClipboard: function() {
    var self = this;
    var state = this.state;
    var props = this.props;
    if (state.hasFlash) {
      var zeroClipboard = new ZeroClipboard(this.refs[props.title].getDOMNode());
      ZeroClipboard.on('error', function() {
        Modernizr.flash = false;
        self.setState({hasFlash: false});
        ZeroClipboard.destroy();
      });

      var content = props.content;

      zeroClipboard.on('copy', function(e) {
        var clipboard = e.clipboardData;

        self.setState({copied: true});
        setTimeout(function() {
          self.setState({copied: false});
        }, 1500);
        clipboard.setData('text/plain', content);
      });
    }
  },

  componentDidMount: function() {
    this.setupClipboard();
  },

  render: function() {
    var state = this.state;
    var props = this.props;
    var title = props.title;
    var id = title.replace(/ /g, '_');
    var expanded = props.expanded === this;
    var disabled = !props.content;
    var download = state.supportsDownload ? a : button;
    var copyLabel;

    if (disabled) {
      copyLabel = 'Building';
    } else if (state.hasFlash && state.copied) {
      copyLabel = 'Copied';
    } else {
      copyLabel = 'Copy';
    }
    return li(null,
      span({className: 'box downloadOverlay-option'},
        label({htmlFor: id}, title),
        span(null, '(',
          download({className: 'link', onMouseDown: this.clickDownload, href: state.href, download: state.download}, 'Download'), '|',
          button({className: 'clipboard link', ref: props.title, type: 'button', onClick: this.clickClipboard}, copyLabel), ')'
        )
      ),
      expanded && textarea({id: id, ref: 'textarea', autoFocus: true, spellCheck: false, value: props.content, defaultValue: 'building...'})
    );
  },

  componentDidUpdate: function() {
    this.setupClipboard();
    var textarea = this.refs.textarea;
    textarea && textarea.getDOMNode().select();
  },

  clickDownload: function() {
    var props = this.props;
    if (this.state.supportsDownload) {
      var content = props.content;
      var blob = new Blob([content], {type : props.type});
      this.setState({href: URL.createObjectURL(blob), download: props.filename});
    } else {
      props.updateAction(props.path);
    }
  },

  clickClipboard: function() {
    if (!this.state.hasFlash) {
      this.props.toggleTextarea(this);
    }
  }
});


module.exports = DownloadOverlayOption;
