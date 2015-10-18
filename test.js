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
var reflinks = require('./');
var _ = require('lodash');

function render (str, settings, ctx, cb) {
  if (typeof ctx === 'function') {
    cb = ctx; ctx = {};
  }
  cb(null, _.template(str, settings)(ctx));
}

describe('async', function () {
  it('should generate reflinks:', function () {
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
