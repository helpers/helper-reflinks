/*!
 * helper-reflinks <https://github.com/helpers/helper-reflinks>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function (options) {
  options = options || {};
  var configProp = options.configProp || 'reflinks';

  /**
   * Config cache
   */

  var config = {};

  /**
   * Load package.json, caching results to avoid multiple
   * calls to the file system
   */

  if (typeof config.pkg === 'undefined') {
    config.pkg = require('load-pkg');
  }

  /**
   * Get keys from `dependencies`
   */

  if (typeof config.keys === 'undefined') {
    config.keys = keys(config.pkg.dependencies || {});
  }

  /**
   * Generate a reflink or list of reflinks for npm modules.
   *
   *   - If no repo names are passed, reflinks are generated for all locally-installed
   *     dependencies listed in package.json
   *   - If names are passed, reflinks are generated both from matching locally-
   *     installed dependencies and, if necessary, by querying npm.
   *
   * @param  {String|Array} `repos` Repo name or array of names.
   * @param  {Object} `options`
   * @param  {Function} `cb`
   * @return {Array}
   */

  function reflinks(repos, opts, cb) {
    if (typeof repos === 'function') {
      cb = repos;
      opts = {};
      repos = null;
    }
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    repos = repos || [];
    opts = utils.extend({}, options, opts);


    // allow a prop-string to be passed: eg: `related("a.b.c")`,
    // so that `get()` can resolve the value from the context
    if (this && this.context && typeof repos === 'string') {
      opts = utils.extend({}, this.options, opts);
      var res = utils.get(this.context, [configProp, repos].join('.'));
      if (res) repos = res;
    }

    var deps = reflinks.sync(repos, opts);

    if (!repos || !repos.length) {
      return typeof cb === 'function'
        ? cb(null, deps)
        : deps;
    }

    // generate reflinks from npm packages
    getRepos(arrayify(repos), opts, function (err, res) {
      if (err) return cb(err);
      if (opts.node_modules === true) {
        res += '\n' + deps;
      }
      cb(null, res);
    });
  }

  /**
   * Generate a list of markdown-formatted reflinks for all
   * dependencies currently listed in `node_modules`.
   *
   * @param  {Array|String} `repos` Repo name or array of repo names
   * @param  {Object} `opts`
   * @param  {Function} `cb` Callback function
   * @return {String}
   */

  reflinks.sync = function (repos, opts) {
    message('node_modules', opts);

    if (!config.keys.length) return '';
    repos = repos ? arrayify(repos) : null;
    var keys = [];

    var len = repos && repos.length;
    if (len) {
      while (len--) {
        var name = repos[len];
        if (config.keys.indexOf(name) !== -1) {
          keys.push(name);
        }
      }
    } else {
      keys = config.keys;
    }
    return linkifyDeps(keys);
  };

  /**
   * Get package.json files from npm for an array of repositories,
   * and use them to generate a list of markdown-formatted reflinks.
   *
   * @param  {Array|String} `repos` Repo name or array of repo names
   * @param  {Object} `opts`
   * @param  {Function} `cb` Callback function
   * @return {String}
   */

  function getRepos(repos, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    opts = opts || {};
    message('npm', opts);

    utils.getPkgs(repos, function (err, pkgs) {
      if (err) {
        console.error(utils.red('helper-reflinks: %j'), err);
        return cb(err);
      }

      pkgs = pkgs.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });

      utils.reduce(pkgs, [], function (acc, pkg, next) {
        var link = utils.mdu.reference(pkg.name, pkg.homepage);
        link = link.replace(/#readme$/, '');
        next(null, acc.concat(link));
      }, function (err, arr) {
        if (err) return cb(err);
        cb(null, arr.join('\n'));
      });
    });
  }

  /**
   * Generate a reference link for each module name in the array
   * of `keys`, and return a formatted list.
   *
   * @param  {Array} `keys` Array of module names.
   * @return {String} Markdown reflinks
   */

  function linkifyDeps(keys) {
    var len = keys.length, i = 0;
    var res = '';
    while (len--) {
      var dep = keys[i++];
      var ele = node_modules(dep);
      var ref = homepage(ele);
      if (ref) {
        res += utils.mdu.reference(ref.repo, ref.url) + '\n';
      }
    }
    return res;
  }

  /**
   * Get the package.json from the given module in node_modules.
   *
   * @param  {String} `name` The name of the module
   * @return {Object}
   */

  function node_modules(name) {
    try {
      var fp = path.resolve('node_modules', name, 'package.json');
      return require(fp);
    } catch(err) {}
    return {};
  }

  /**
   * Get the homepage from the given module in node_modules.
   *
   * @param  {Object} `pkg` package.json object for the module
   * @return {Object}
   */

  function homepage(pkg) {
    var res = {};
    if (!pkg.repository) return null;
    if (typeof pkg.repository === 'string') {
      res = utils.parse(pkg.repository);
    } else if (typeof pkg.repository === 'object') {
      res = utils.parse(pkg.repository.url);
    }
    res.url = utils.stringify(res.user, res.repo);
    return res;
  }

  /**
   * Output a formatted message in the console.
   *
   * @param  {String} `origin` The location of the package (node_modules or npm)
   * @param  {Object} `opts` Options
   */

  function message(origin, opts) {
    if (opts && opts.silent !== true) {
      var msg = '  helper-reflinks: generating reflinks from ' + origin + ' info.';
      console.log('  ' + utils.green(utils.success) + utils.gray(msg));
    }
  }

  /**
   * Utils
   */

  function keys(o) {
    return Object.keys(o).sort();
  }

  function arrayify(val) {
    return Array.isArray(val) ? val : [val];
  }

  /**
   * Expose `reflinks`
   */

  return reflinks;
};
