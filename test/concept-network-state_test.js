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

    var cn, cns, node1, node2, node3;

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

    describe('##getMaximumActivationValue', function () {

      before(function () {
        cn = new ConceptNetwork();
        cns = new ConceptNetworkState(cn);
        node1 = cn.addNode("Node 1");
        node2 = cn.addNode("sNode 2");
        node3 = cn.addNode("tNode 3");
      });

      it('should return 0 when no node is activated', function () {
        assert.equal(cns.getMaximumActivationValue(), 0);
      });

      it('should get the maximum activation value for any token', function () {
        cns.setActivationValue(node1.id, 75);
        cns.setActivationValue(node2.id, 70);
        cns.setActivationValue(node3.id, 50);
        assert.equal(cns.getMaximumActivationValue(), 75);
      });

      it('should get the maximum activation value for t tokens', function () {
        cns.setActivationValue(node1.id, 75);
        cns.setActivationValue(node2.id, 70);
        cns.setActivationValue(node3.id, 50);
        assert.equal(cns.getMaximumActivationValue('s'), 70);
      });
    });

    describe('##getActivatedTypedNodes', function () {

      before(function () {
        cn = new ConceptNetwork();
        cns = new ConceptNetworkState(cn);
        node1 = cn.addNode("Node 1");
        node2 = cn.addNode("sNode 2");
        node3 = cn.addNode("tNode 3");
      });

      it('should return an empty array', function () {
        assert.deepEqual(cns.getActivatedTypedNodes(), []);
      });

      it('should return one-node-array', function () {
        cns.setActivationValue(node1.id, 100);
        var result = cns.getActivatedTypedNodes();
        assert.deepEqual(result,
          [{"node": {"id": 1, "label": "Node 1", "occ": 1},
            "activationValue": 100}]);
      });

      it('should return two-nodes-array', function () {
        cns.setActivationValue(node2.id, 95);
        var result = cns.getActivatedTypedNodes();
        assert.deepEqual(result,
          [{"node": {"id": 1, "label": "Node 1", "occ": 1},
            "activationValue": 100},
           {"node": {"id": 2, "label": "sNode 2", "occ": 1},
            "activationValue": 95}
          ]);
      });

      it('should return one-node-array of type s', function () {
        cns.setActivationValue(node2.id, 95);
        var result = cns.getActivatedTypedNodes('s');
        assert.deepEqual(result,
          [{"node": {"id": 2, "label": "sNode 2", "occ": 1},
            "activationValue": 95}
          ]);
      });

      it('should return one-node-array where threshold = 96', function () {
        cns.setActivationValue(node1.id, 100);
        var result = cns.getActivatedTypedNodes('', 96);
        assert.deepEqual(result,
          [{"node": {"id": 1, "label": "Node 1", "occ": 1},
            "activationValue": 100}]);
      });

    });



      /*(self, cn, typeNames, threshold=90):
        """Get the activated nodes of cn.

        The returned nodes must be in the list of typeNames, and
        have an activation value greater than threshold

        Return a list of tuples (node,activation value)"""')*/

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

    it('should accept options', function () {
      assert.doesNotThrow(function () {
        cns.propagate({anything: 1});
      },
      null,
      "unexpected error");
    });

    it('should take decay into account', function () {
      cns.propagate({decay: 200});
      assert.deepEqual(cns.nodeState, {}, 'all nodes should be deactivated');
    });

    it('should take memoryPerf into account', function () {
      cns.activate(node1.id);
      cns.propagate({memoryPerf: Infinity});
      assert.equal(cns.getActivationValue(node1.id), 60,
        'with an infinite memory perf, activation should not decay too much');
    });

  });

});
