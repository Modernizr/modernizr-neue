var Modernizr = require('modernizr');

// `minify` isn't really an option, in the modernizr-the-library sense. however,
// it is treated the same as one in the modernizr-the-download-page sense.
// Rather than make this change every time we need to use the options, we have this
// neat lil convenience wrapper around it

var options = Modernizr.options().sort(function(a, b) {
      return a.name > b.name ? 1 : -1;
    }).concat({
      name: 'minify',
      property: 'minify',
      group: 'minify',
      selected: true
    },{
      name: 'Add CSS classes',
      property: 'setClasses',
      selected: true
    });

module.exports = options;
