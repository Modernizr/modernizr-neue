'use strict';
require('fontfaceobserver/fontfaceobserver');

new window.FontFaceObserver('Source Sans Pro', {})
  .check()
  .then(function() {
    document.documentElement.className += ' font-loaded';
  });
