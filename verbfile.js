'use strict';

module.exports = function(verb) {
  verb.invoke('verb-generate-readme');

  verb.helper('tag', function(str) {
    return '{%= ' + str;
  });

  verb.helper('nickname', function(name) {
    return name.slice('helper-'.length);
  });

  verb.task('default', ['readme']);
};
