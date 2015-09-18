var copyright = function(prefix, suffix) {
  var text = "Copyright &copy; ";
  // prefix
  if(typeof prefix == "string") text += prefix;
  // add year
  var today = new Date();
  var year = today.getFullYear();
  text += year;
  // suffix
  if(typeof suffix == "string") text += ", "+ suffix;
  return text;
}

module.exports = copyright;
