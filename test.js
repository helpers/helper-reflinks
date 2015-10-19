/*!
 * helper-reflinks <https://github.com/helpers/helper-reflinks>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('mocha');
require('should');
var handlebars = require('handlebars');
var helper = require('./');
var assemble = require('assemble-core');
var _ = require('lodash');
var reflinks, app;

function render(str, settings, ctx, cb) {
  if (typeof ctx === 'function') {
    cb = ctx; ctx = {};
  }
  cb(null, _.template(str, settings)(ctx));
}

describe('async', function() {
  this.slow(500);

  beforeEach(function() {
    reflinks = helper();
  });

  it('should generate reflinks:', function() {
    reflinks('').should.match(/async/);
  });

  it('should generate reflinks for a repo:', function (done) {
    reflinks('async', function  (err, res) {
      res.should.equal('[async]: https://github.com/caolan/async');
      done();
    });
  });

  it('should work as an async helper:', function (done) {
    render('<%= reflinks() %>', {imports: {reflinks: reflinks}}, function (err, res) {
      res.should.match(/async/);
      done();
    })
  });

  it('should combine both node_modules and with specified repos:', function (done) {
    render('<%= reflinks("", {node_modules: true}) %>', {imports: {reflinks: reflinks}}, function (err, res) {
      res.should.match(/async/);
      res.should.match(/load-pkg/);
      done();
    })
  });
});

describe('sync', function () {
  beforeEach(function () {
    reflinks = helper();
  });

  it('should return a formatted reflinks statement:', function () {
    reflinks.sync('').should.match(/async/);
  });

  it('should work as a lodash helper:', function () {
    var actual = _.template('<%= reflinks("") %>', {imports: {reflinks: reflinks}})();
    actual.should.match(/async/);
  });

  it('should work as a handlebars helper:', function () {
    handlebars.registerHelper('reflinks', reflinks);
    handlebars.compile('{{reflinks ""}}')().should.match(/async/);
  });
});


describe('helper', function () {
  this.slow(500);

  beforeEach(function () {
    app = assemble();
    app.engine('hbs', require('engine-handlebars'));
    app.engine('md', require('engine-base'));

    // custom view collections
    app.create('pages', {engine: 'hbs'});
    app.create('posts', {engine: 'md'});

    // add helper
    app.asyncHelper('reflinks', helper(app.options));
  });

  it('should work with engine-handlebars:', function (cb) {
    this.timeout(2000);
    app.page('abc', {content: 'foo {{reflinks list}} bar'})
      .render({list: ['micromatch']}, function (err, res) {
        if (err) return cb(err);
        res.content.should.match(/\[micromatch\]/);
        cb();
      });
  });

  it('should use global options', function (cb) {
    this.timeout(2000);
    app.option('remove', ['flflflfl']);
    app.page('abc', {content: 'foo {{reflinks list}} bar'})
      .render({list: ['micromatch', 'flflflfl']}, function (err, res) {
        if (err) return cb(err);
        res.content.should.match(/\[micromatch\]/);
        cb();
      });
  });

  it('should work with engine-base:', function (cb) {
    this.timeout(2000);
    app.post('xyz', {content: 'foo <%= reflinks(list) %> bar'})
      .render({list: ['micromatch']}, function (err, res) {
        if (err) return cb(err);
        res.content.should.match(/\[micromatch\]/);
        cb();
      });
  });

  it('should work using values from the context:', function (cb) {
    this.timeout(2000);

    app.data('list', ['micromatch']);
    app.post('xyz', {content: 'foo <%= reflinks(list) %> bar'})
      .render(function (err, res) {
        if (err) return cb(err);
        res.content.should.match(/\[micromatch\]/);
        cb();
      });
    cb();
  });

  it('should use configProp:', function (cb) {
    this.timeout(2000);

    app.asyncHelper('reflinks', helper({
      configProp: 'foo'
    }));

    app.data('foo.a.b.c', ['micromatch']);
    app.post('xyz', {content: 'foo <%= reflinks("a.b.c") %> bar'})
      .render(function (err, res) {
        if (err) return cb(err);
        res.content.should.match(/\[micromatch\]/);
        cb();
      });
    cb();
  });
});
