var reflinks = require('./');
var pkg = require('./package');

var deps = Object.keys(pkg.dependencies);

reflinks(deps, {verbose: true}, function(err, links) {
  if (err) return console.log(err);
  console.log()
  console.log(links)
});
