var copyright = function(prefix) {
  var text = "Copyright © ";
  // prefix
  if(typeof prefix === "string") text += prefix;

  return text + (new Date()).getFullYear();
};

module.exports = copyright;
