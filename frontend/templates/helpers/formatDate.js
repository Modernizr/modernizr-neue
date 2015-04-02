'use strict';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var formatDate = function(date) {
  if (!date) {
    return;
  }

  return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
};

module.exports = formatDate;
