/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*global describe:true, it:true, before:true */
"use strict";

// # Tests for concept-network-state module

// ## Required libraries
var assert = require('assert');

// Module to test
var ConceptNetwork = require('../lib/concept-network').ConceptNetwork;
var ConceptNetworkState = require('../lib/concept-network-state')
                          .ConceptNetworkState;

// ## ConceptNetwork
describe('ConceptNetworkState', function () {
  // ### Constructor
  describe('#Constructor', function () {

    it('should throw an exception if no ConceptNetwork is given', function () {
      assert.throws(function () {
        var cns = new ConceptNetworkState();
      },
      Error);
    });

    it('should not throw an exception', function () {
      assert.doesNotThrow(function () {
        var cn = new ConceptNetwork();
        var cns = new ConceptNetworkState(cn);
      }, null, "unexpected error");
    });


  });


});
