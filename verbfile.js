'use strict';

var verb = require('verb');

verb.helper('shorten', function (str) {
  return str.split('helper-').join('');
});

verb.helper('tag', function (str) {
  return '{%= ' + str;
});

verb.task('default', function() {
  verb.src('.verb*.md')
    .pipe(verb.dest('./'));
});
