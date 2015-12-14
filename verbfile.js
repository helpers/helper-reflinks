'use strict';

module.exports = function(verb, base, env) {
  verb.helper('tag', function(str) {
    return '{%= ' + str;
  });

  verb.helper('nickname', function(name) {
    return name.split('helper-').join('');
  });

  verb.task('default', function(cb) {
    verb.toStream('docs', function(key, view) {
        return key === '.verb';
      })
      .pipe(verb.renderFile())
      .on('error', cb)
      .pipe(verb.pipeline())
      .on('error', cb)
      .pipe(verb.dest('.'))
      .on('finish', cb);
  });
};
