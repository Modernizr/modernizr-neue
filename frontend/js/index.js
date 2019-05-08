'use strict';
var FontFaceObserver = require('fontfaceobserver');

var font = new FontFaceObserver('Source Sans Pro');

font.load()
    .then(function() {
        document.documentElement.className += ' font-loaded';
    });
