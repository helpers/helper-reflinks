'use strict';

module.exports = function(verb) {
  verb.extendWith('verb-readme-generator');

  verb.helper('tag', function(str) {
    return '{%= ' + str;
  });

  verb.helper('nickname', function(name) {
    return name.slice('helper-'.length);
  });

  verb.task('default', ['readme']);
};
