/*!
 * helper-reflinks <https://github.com/helpers/helper-reflinks>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var chalk = require('chalk');
var symbol = require('log-symbols');
var parse = require('parse-github-url');
var stringify = require('stringify-github-url');
var config = require('load-pkg');
var mdu = require('markdown-utils');

/**
 * Expose `reflinks`
 */

module.exports = reflinks;

/**
 * Generate a reflink or list of reflinks for npm modules.
 *
 *   - If no repo names are passed, reflinks are generated for all locally-installed
 *     dependencies listed in package.json
 *   - If names are passed, reflinks are generated both from matching locally-
 *     installed dependencies and, if necessary, by querying npm.
 *
 * @param  {Array} repos [description]
 * @param  {Function} cb [description]
 * @return {Array}
 */

function reflinks(repos, options, cb) {
  if (typeof repos === 'function') {
    cb = repos;
    options = {};
    repos = null;
  }
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options = options || {};

  if (typeof repos !== 'string' && !Array.isArray(repos)) {
    throw new TypeError('helper-reflinks expects a string or array.');
  }

  var deps = reflinks.sync(options);
  repos = repos || '';

  if (!repos || !repos.length) {
    if (typeof cb === 'function') {
      return cb(null, deps);
    }
    return deps;
  }

  // generate reflinks from npm packages
  getRepos(repos, options, cb);
};

reflinks.sync = function (options) {
  message('node_modules', options);
  return linkifyDeps(config);
};

function getRepos(repos, options, cb) {
  var async = require('async');
  var get = require('get-pkgs');

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  message('npm', options);

  get(repos, function (err, pkgs) {
    if (err) {
      console.error(chalk.red('helper-reflinks: %j'), err);
      return cb(err);
    }
    async.mapSeries(pkgs, function (pkg, next) {
      next(null, linkify(pkg.name, pkg.homepage));
    }, function (err, arr) {
      if (err) {
        console.error(chalk.red('helper-reflinks: %j'), err);
        return cb(err);
      }
      cb(null, arr.join('\n'));
    });
  });
}

function linkify(repo, url) {
  return mdu.reference(repo, url);
}

function listDeps(pkg) {
  var deps = Object.keys(pkg.dependencies) || [];
  return deps.sort();
}

function linkifyDeps(pkg) {
  if (!pkg.dependencies) {
    return null;
  }

  var deps = listDeps(pkg);
  var len = deps.length, i = 0;
  var res = '';

  while (len--) {
    var dep = deps[i++];
    var ele = node_modules(dep);
    var ref = homepage(ele);
    if (ref) {
      res += linkify(ref.repo, ref.url) + '\n';
    }
  }
  return res;
}

function node_modules(name) {
  try {
    var fp = path.resolve('node_modules', name, 'package.json');
    return require(fp);
  } catch(err) {}
  return {};
}

function homepage(pkg) {
  var res = {};
  if (!pkg.repository) return null;
  if (typeof pkg.repository === 'string') {
    res = parse(pkg.repository);
  } else if (typeof pkg.repository === 'object') {
    res = parse(pkg.repository.url);
  }
  res.url = stringify(res.user, res.repo);
  return res;
}

function message(place, options) {
  if (options && options.silent !== true) {
    var msg = '  helper-reflinks: generating reflinks from ' + place + ' info.';
    console.log('  ' + symbol.success + chalk.gray(msg));
  }
}
