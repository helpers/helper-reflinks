/*!
 * helper-reflinks <https://github.com/helpers/helper-reflinks>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var success = require('success-symbol');
var colors = require('ansi-colors');
var utils = require('./utils');

module.exports = function(options) {
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
    config.pkg = require('load-pkg').sync(process.cwd());
  }

  /**
   * Get keys from `dependencies`
   */

  if (typeof config.keys === 'undefined') {
    config.keys = utils.keys(config.pkg.dependencies || {});
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
      return reflinks(null, {}, repos);
    }

    if (typeof opts === 'function') {
      return reflinks(repos, {}, opts);
    }

    repos = repos || [];
    opts = utils.extend({}, options, opts);

    if (this && this.options) {
      opts = utils.extend({}, this.options, opts);
    }

    // allow a prop-string to be passed: eg: `related("a.b.c")`,
    // so that `get()` can resolve the value from the context
    if (this && this.context && typeof repos === 'string') {
      var res = utils.get(this.context, [configProp, repos].join('.'));
      if (res) repos = res;
    }

    opts.remove = utils.arrayify(opts.remove);
    if (opts.remove.length) {
      utils.remove(repos, opts.remove);
    }

    var deps = reflinks.sync(repos, opts);

    if (!repos || !repos.length) {
      return typeof cb === 'function' ? cb(null, deps) : deps;
    }

    // generate reflinks from npm packages
    getRepos(utils.arrayify(repos), opts, function(err, res) {
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

  reflinks.sync = function(repos, opts) {
    if (!config.keys.length) return '';
    repos = repos ? utils.arrayify(repos) : null;
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

    if (opts && opts.verbose && opts.sync) {
      console.log(' ' + colors.green(success) + ' created ' + keys.length + ' reference links from node_modules packages');
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

    if (opts.verbose) {
      spinner();
      process.stdout.write(' creating reference links from npm data');
    }

    utils.getPkgs(repos, function(err, pkgs) {
      if (err) {
        console.error(colors.red('helper-reflinks: %j'), err);
        return cb(err);
      }

      pkgs = pkgs.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });

      utils.reduce(pkgs, [], function(acc, pkg, next) {
        var link = utils.referenceLink(pkg.name, pkg.homepage);
        link = link.replace(/#readme$/, '');
        next(null, acc.concat(link));
      }, function(err, arr) {
        if (err) return cb(err);

        if (opts.verbose) {
          stopSpinner();
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(' ' + colors.green(success) + ' created ' + pkgs.length + ' reference links from npm data\n');
        }
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
        res += utils.referenceLink(ref.repo, ref.url) + '\n';
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

  function spinner() {
    var arr = ['|', '/', '-', '\\', '-'];
    var len = arr.length, i = 0;
    spinner.timer = setInterval(function () {
      process.stdout.clearLine();
      process.stdout.cursorTo(1);
      process.stdout.write(' \u001b[0G' + arr[i++ % len] + ' ');
    }, 200);
  }

  function stopSpinner() {
    process.stdout.write('\u001b[2K');
    clearInterval(spinner.timer);
  }

  if (utils.isValidGlob(options)) {
    reflinks.apply(null, arguments);
    return;
  }

  /**
   * Expose `reflinks`
   */

  return reflinks;
};
