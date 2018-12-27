/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
/*global describe:true, it:true, before:true */
"use strict";

// # Tests for concept-network module

// ## Required libraries
var assert = require('assert');

// Module to test
var tools = require('../lib/tools');
var startsWith = tools.startsWith;

describe("tools", function () {

  describe('startsWith', function () {
    it('should return false in normal cases', function () {
      assert.equal(startsWith("abc","de"), false);
    });

    it('should return false when string1 is shorter than string2', function () {
      assert.equal(startsWith("de","def"), false);
    });
  });

});
