/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*global describe:true, it:true, before:true, beforeEach:true */
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

  describe('#activate', function () {

    var cn, cns, node1;
    before(function () {
      cn = new ConceptNetwork();
      cns = new ConceptNetworkState(cn);
      node1 = cn.addNode("Node 1");
    });

    it('should put the node activation to 100', function () {
      cns.activate(node1.id);
      assert.equal(cns.nodeState[node1.id].activationValue, 100);
    });

  });

  describe('#getters', function () {

    var cn, cns, node1, node2;

    describe('##getActivationValue', function () {

      before(function () {
        cn = new ConceptNetwork();
        cns = new ConceptNetworkState(cn);
        node1 = cn.addNode("Node 1");
        node2 = cn.addNode("Node 2");
        cns.activate(node1.id);
      });

      it('should get a zero activation value', function () {
        assert.deepEqual(cns.getActivationValue(node2.id), 0);
      });

      it('should get a 100 activation value', function () {
        assert.deepEqual(cns.getActivationValue(node1.id), 100);
      });
    });

    describe('##getOldActivationValue', function () {

      before(function () {
        cn = new ConceptNetwork();
        cns = new ConceptNetworkState(cn);
        node1 = cn.addNode("Node 1");
        node2 = cn.addNode("Node 2");
        cns.activate(node1.id);
        cns.propagate();
      });

      it('should get a zero activation value', function () {
        assert.deepEqual(cns.getOldActivationValue(node2.id), 0);
      });

      it('should get a 100 activation value', function () {
        assert.deepEqual(cns.getOldActivationValue(node1.id), 100);
      });
    });

  });

  describe('#setters', function () {

    var cn, cns, node1, node2;

    describe('##setActivationValue', function () {

      before(function () {
        cn = new ConceptNetwork();
        cns = new ConceptNetworkState(cn);
        node1 = cn.addNode("Node 1");
        node2 = cn.addNode("Node 2");
      });

      it('should set a zero activation value', function () {
        cns.setActivationValue(node2.id, 0);
        assert.deepEqual(cns.getActivationValue(node2.id), 0);
      });

      it('should set a 75 activation value', function () {
        cns.setActivationValue(node1.id, 75);
        assert.deepEqual(cns.getActivationValue(node1.id), 75);
      });

    });
  });

  describe('#propagate', function () {

    var cn, cns, node1, node2;
    before(function () {
      cn = new ConceptNetwork();
      cns = new ConceptNetworkState(cn);
      node1 = cn.addNode("Node 1");
      node2 = cn.addNode("Node 2");
      cn.addLink(node1.id, node2.id);
    });

    it('should deactivate node without afferent links', function () {
      cns.activate(node1.id);
      assert.equal(cns.getActivationValue(node1.id), 100);
      cns.propagate();
      assert.equal(cns.getActivationValue(node1.id) < 100, true);
    });

    it('should activate node 2', function () {
      assert.equal(cns.getActivationValue(node2.id) > 0, true);
    });

  });

});
