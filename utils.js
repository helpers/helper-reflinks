'use strict';

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('ansi-magenta', 'magenta');
require('arr-union', 'union');
require('data-store', 'Store');
require('success-symbol', 'success');
require('parse-github-url', 'parse');
require('stringify-github-url', 'stringify');
require('async-array-reduce', 'reduce');
require('extend-shallow', 'extend');
require('is-valid-glob');
require('markdown-reference', 'referenceLink');
require('get-value', 'get');
require('get-pkgs');
require('time-diff', 'Time');
require = fn;

/**
 * Utils
 */

utils.keys = function(o) {
  return Object.keys(o).sort();
};

utils.arrayify = function(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

utils.remove = function(arr, items) {
  var len = arr.length;
  while (len--) {
    if (items.indexOf(arr[len]) > -1) {
      arr.splice(1, len);
    }
  }
  return arr;
};

/**
 * Expose utils
 */

module.exports = utils;
