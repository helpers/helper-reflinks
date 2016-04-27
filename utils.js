'use strict';

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('arr-union', 'union');
require('extend-shallow', 'extend');
require('reflinks');
require = fn;

/**
 * Utils
 */

utils.keys = function(o) {
  return Object.keys(o).sort();
};

utils.arrayify = function(val) {
  return (val ? (Array.isArray(val) ? val : [val]) : []).sort();
};

/**
 * Expose utils
 */

module.exports = utils;
