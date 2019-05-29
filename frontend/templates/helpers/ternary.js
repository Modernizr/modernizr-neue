'use strict';

var ternary = function(val, condition, yes, no) {
  return val === condition ? yes : no;
};

module.exports = ternary;
