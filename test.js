/*!
 * helper-reflinks <https://github.com/jonschlinkert/helper-reflinks>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var handlebars = require('handlebars');
var _ = require('lodash');
var reflinksHelper = require('./');

function test(str) {
  return /\[lookup-deps\]/.test(str);
}

describe('helper reflinks', function () {
  var links = reflinksHelper();
  it('should return a formatted reflinks statement:', function () {
    test(links).should.be.true;
  });

  it('should work as a lodash helper:', function () {
    test(_.template('<%= reflinks() %>', {imports: {reflinks: reflinksHelper}})({})).should.be.true;
  });

  it('should work as a lodash mixin:', function () {
    _.mixin({reflinks: reflinksHelper});
    test(_.template('<%= _.reflinks() %>')({})).should.be.true;
  });

  it('should work as a handlebars helper:', function () {
    handlebars.registerHelper('reflinks', reflinksHelper);
    test(handlebars.compile('{{reflinks "*"}}')()).should.be.true;
  });
});
