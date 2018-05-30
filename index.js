'use strict';

const union = require('arr-union');
const reflinks = require('reflinks');
const arrayify = val => [].concat(val || []).sort();

/**
 * Generate a reflink or list of reflinks for npm modules.
 *
 *   - If no repo names are passed, reflinks are generated for all locally-installed
 *     dependencies listed in package.json
 *   - If names are passed, reflinks are generated both from matching locally-
 *     installed dependencies and, if necessary, by pulling them down from npm.
 *
 * @param  {String|Array} `repos` Repo name or array of names.
 * @param  {Object} `options`
 * @param  {Function} `cb`
 * @return {Array}
 */

module.exports = function(config) {
  return function(names, options, cb) {
    if (typeof names === 'function') {
      cb = names;
      options = {};
      names = null;
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    const app = this || {};
    const opts = Object.assign({}, config, options, app.options);
    const ctx = Object.assign({}, app.context);

    names = arrayify(names);
    names = union([], names, opts.names, ctx.names);

    if (names.length === 0) {
      cb(null, '');
      return;
    }

    reflinks(names, opts, function(err, res) {
      if (err) return cb(err);
      cb(null, '\n\n' + res.links.join('\n'));
    });
  };
};
