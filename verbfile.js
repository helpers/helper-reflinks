'use strict';

var verb = require('verb');

verb.task('default', function() {
  verb.src('.verb*.md')
    .pipe(verb.dest('./'));
});
