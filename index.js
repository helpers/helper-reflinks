/*!
 * helper-reflinks <https://github.com/jonschlinkert/helper-reflinks>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var Lookup = require('lookup-deps');
var deps = new Lookup();

module.exports = function (patterns) {
  return deps.reflinks(patterns || '*');
};