'use strict';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var formatDate = function(date) {
  // take a `Date` object, and format it in the way we want for the `/news` section
  // e.g. Jan 1, 2000
  if (!date) {
    return;
  }

  return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
};

module.exports = formatDate;
