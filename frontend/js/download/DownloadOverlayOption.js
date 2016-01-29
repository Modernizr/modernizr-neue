'use strict';
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DOM = React.DOM, textarea = DOM.textarea, a = DOM.a, li = DOM.li, label = DOM.label, button = DOM.button, span=DOM.span;

var DownloadOverlayOption = React.createClass({
  mixins: [PureRenderMixin],

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
      var zeroClipboard = new ZeroClipboard(this.refs[props.title]);
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
    var busy = false;

  if (!disabled && state.hasFlash && state.copied) {
      copyLabel = 'Copied';
    } else {
      copyLabel = 'Copy to Clipboard';
      busy = true;
    }
    return li(null,
      span({className: 'box downloadOverlay-option'},
        label({htmlFor: id}, title),
        span(null,
           button({className: 'clipboard fakelink', ref: props.title, type: 'button', onClick: this.clickClipboard, 'aria-busy': busy, autoFocus: true}, copyLabel),
          '|',
          download({className: 'fakelink', onMouseDown: this.clickDownload, href: state.href, download: state.download}, 'Download')
        )
      ),
      expanded && textarea({id: id, ref: 'textarea', autoFocus: true, spellCheck: false, value: props.content, defaultValue: 'building...'})
    );
  },

  componentDidUpdate: function() {
    this.setupClipboard();
    var textarea = this.refs.textarea;
    textarea && textarea.select();
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
