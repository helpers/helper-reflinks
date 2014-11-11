'use strict';

var verb = require('verb');

verb.helper('reflinks', require('./'));

verb.task('default', function() {
  verb.src('.verb*.md')
    .pipe(verb.dest('./'));
});
