'use strict';
require('fontfaceobserver');

new window.FontFaceObserver('Open Sans', {})
  .check()
  .then(function() {
    document.documentElement.className += ' font-loaded';
  });
