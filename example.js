var reflinks = require('./')();
var pkg = require('./package');

var deps = Object.keys(pkg.dependencies);

reflinks(deps, function(err, links) {
  if (err) throw err;
  console.log(links)
  console.log()
});
