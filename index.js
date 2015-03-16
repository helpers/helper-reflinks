/*!
 * helper-reflinks <https://github.com/helpers/helper-reflinks>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var async = require('async');
var symbol = require('log-symbols');
var parse = require('parse-github-url');
var stringify = require('stringify-github-url');
var config = require('load-pkg');
var mdu = require('markdown-utils');
var get = require('get-pkgs');

module.exports = function reflinks(repos, patterns, cb) {
  if (typeof repos === 'function') {
    cb = repos;
    patterns = null;
    repo = null;
  }

  if (typeof patterns === 'function') {
    cb = patterns;
    patterns = null;
  }

  if (repos && typeof repos !== 'string' && !Array.isArray(repos)) {
    throw new TypeError('helper-reflinks expects a string or array.');
  }

  if (!repos) {
    return cb(null, listDeps(config));
  }

  var msg = '  helper-reflinks: getting reference links from npm.';
  console.log('  ' + symbol.success + chalk.gray(msg));

  get(repos, patterns, function (err, pkgs) {
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
  return mdu.reference(repo, url) + '\n';
}

function listDeps(pkg) {
  if (!pkg.dependencies) {
    return null;
  }

  var deps = Object.keys(pkg.dependencies).sort();
  var len = deps.length, i = 0;
  var res = '';

  while (len--) {
    var dep = deps[i++];
    var pkg = npm(dep);
    var ref = homepage(pkg);

    res += linkify(ref.repo, ref.url)
  }
  return res;
}

listDeps(config);

function npm(name) {
  try {
    var fp = path.resolve('node_modules', name, 'package.json');
    return require(fp);
  } catch(err) {}
  return null;
}

function homepage(pkg) {
  var res = {};
  if (typeof pkg.repository === 'string') {
    res = parse(pkg.repository);
  } else if (typeof pkg.repository === 'object') {
    res = parse(pkg.repository.url);
  }

  res.url = stringify(res.user, res.repo)
  return res;
}
