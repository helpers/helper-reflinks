'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const assemble = require('assemble-core');
const helper = require('./');
let app;

const reflinks = function(options) {
  return function(names) {
    let fn = helper(options || {verbose: false});
    let args = [].slice.call(arguments);
    if (typeof names !== 'string' && !Array.isArray(names)) {
      let pkg = require(path.resolve(process.cwd(), 'package'));
      names = Object.keys(pkg.dependencies || pkg.devDependencies || []);
      args = names.concat(args);
    }
    return fn.apply(null, args);
  };
};

describe('async', function() {
  this.slow(500);

  it('should deal with an empty string:', function(cb) {
    reflinks()('', function(err, links) {
      if (err) return cb(err);
      assert.equal(links, '');
      cb();
    });
  });

  it('should create a reflink for a name as a string:', function(cb) {
    reflinks()('async', function(err, links) {
      if (err) return cb(err);
      assert(/async/.test(links));
      cb();
    });
  });
});

describe('helper', function() {
  this.slow(500);

  beforeEach(function() {
    app = assemble();
    app.engine('hbs', require('engine-handlebars'));
    app.engine('md', require('engine-base'));
    app.disable('verbose');

    // custom view collections
    app.create('pages', {engine: 'hbs'});
    app.create('posts', {engine: 'md'});

    // add helper
    app.asyncHelper('reflinks', reflinks(app.options));
  });

  it('should work with engine-handlebars:', function(cb) {
    this.timeout(2000);
    app.page('abc', {content: 'foo {{reflinks list}} bar'})
      .render({list: ['micromatch']}, function(err, res) {
        if (err) return cb(err);
        assert(/\[micromatch\]/.test(res.content));
        cb();
      });
  });

  it('should use global options', function(cb) {
    this.timeout(2000);
    app.option('remove', ['flflflfl']);
    app.page('abc', {content: 'foo {{reflinks list}} bar'})
      .render({list: ['micromatch', 'flflflfl']}, function(err, res) {
        if (err) return cb(err);
        assert(/\[micromatch\]/.test(res.content));
        cb();
      });
  });

  it('should work with engine-base:', function(cb) {
    this.timeout(2000);
    app.post('xyz', {content: 'foo <%= reflinks(list) %> bar'})
      .render({list: ['micromatch']}, function(err, res) {
        if (err) return cb(err);
        assert(/\[micromatch\]/.test(res.content));
        cb();
      });
  });

  it('should work using values from the context:', function(cb) {
    this.timeout(2000);

    app.data('verb.reflinks', ['micromatch', 'generate', 'verb']);
    app.post('xyz', {content: 'foo <%= reflinks(verb.reflinks) %> bar'})
      .render(function(err, res) {
        if (err) return cb(err);
        assert(/\[micromatch\]/.test(res.content));
        assert(/\[generate\]/.test(res.content));
        assert(/\[verb\]/.test(res.content));
        cb();
      });
  });
});
