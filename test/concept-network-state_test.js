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
        var cns = ConceptNetworkState();
      },
      Error);
    });

    it('should not throw an exception', function () {
      assert.doesNotThrow(function () {
        var cn = ConceptNetwork();
        var cns = ConceptNetworkState(cn);
      }, null, "unexpected error");
    });

    it('should be called from a derived constructor', function () {
      var DerivedConceptNetworkState = function (cn) {
        // Inherit ConceptNetwork
        ConceptNetworkState.call(this, cn);
      };
      var cn = ConceptNetwork();
      var derived = new DerivedConceptNetworkState(cn);
      assert.deepEqual(derived, {});
    });

  });

  describe('#activate', function () {

    var cn, cns, node1;
    before(function (done) {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      cn.addNode("Node 1", function (err, node) {
        node1 = node;
        done(err);
      });
    });

    it('should put the node activation to 100', function (done) {
      cns.activate(node1.id, function (err, nodeState) {
        assert.equal(nodeState.activationValue, 100);
        cns.getActivationValue(node1.id, function (err2, value) {
          assert.equal(value, 100);
          done(err);
        });
      });
    });

    it('should cap the activation of an activated node', function (done) {
      cns.activate(node1.id, function (err, nodeState) {
        assert.equal(nodeState.activationValue, 100);
        done(err);
      });
    });

  });

  describe('#getters', function () {

    var cn, cns, node1, node2, node3;

    describe('##getActivationValue', function () {

      before(function (done) {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        cn.addNode("Node 1", function (err, node) {
          if (err) { return done(err); }
          node1 = node;
          cn.addNode("Node 2", function (err, node) {
            if (err) { return done(err); }
            node2 = node;
            cns.activate(node1.id, function (err, nodeState) {
              done(err);
            });
          });
        });
      });

      it('should get a zero activation value', function (done) {
        cns.getActivationValue(node2.id, function (err, activationValue) {
          assert.deepEqual(activationValue, 0);
          done(err);
        });
      });

      it('should get a 100 activation value', function (done) {
        cns.getActivationValue(node1.id, function (err, activationValue) {
          assert.deepEqual(activationValue, 100);
          done(err);
        });
      });

      it('should get a zero activation value when no callback',
      function (done) {
        assert.equal(cns.getActivationValue(node2.id),0);
        done();
      });

    });

    describe('##getOldActivationValue', function () {

      before(function (done) {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        cn.addNode("Node 1", function (err, node) {
          if (err) { return done(err); }
          node1 = node;
          cn.addNode("Node 2", function (err, node) {
            if (err) { return done(err); }
            node2 = node;
            cns.activate(node1.id, function (err) {
              if (err) { return done(err); }
              cns.propagate(done);
            });
          });
        });
      });

      it('should get a zero activation value', function (done) {
        cns.getOldActivationValue(node2.id, function (err, oldActivationValue) {
          assert.deepEqual(oldActivationValue, 0);
          done(err);
        });
      });

      it('should get a 100 activation value', function (done) {
        cns.getOldActivationValue(node1.id, function (err, oldActivationValue) {
          assert.deepEqual(oldActivationValue, 100);
          done(err);
        });
      });
    });

    describe('##getMaximumActivationValue', function () {

      before(function (done) {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        cn.addNode("Node 1", function (err, node) {
          if (err) { return done(err); }
          node1 = node;
          cn.addNode("sNode 2", function (err, node) {
            if (err) { return done(err); }
            node2 = node;
            cn.addNode("tNode 3", function (err, node) {
              node3 = node;
              done(err);
            });
          });
        });
      });

      it('should return 0 when no node is activated', function (done) {
        cns.getMaximumActivationValue(function (err, maxValue) {
          assert.equal(maxValue, 0);
          done(err);
        });
      });

      it('should get the maximum activation value for any token',
        function (done) {
        cns.setActivationValue(node1.id, 75, function (err) {
          if (err) { return done(err); }
          cns.setActivationValue(node2.id, 70, function (err) {
            if (err) { return done(err); }
            cns.setActivationValue(node3.id, 50, function (err) {
              if (err) { return done(err); }
              cns.getMaximumActivationValue(function (err, maxValue) {
                assert.equal(maxValue, 75);
                done(err);
              });
            });
          });
        });
      });

      it('should get the maximum activation value for s tokens',
        function (done) {
        cns.setActivationValue(node1.id, 75, function (err) {
          if (err) { return done(err); }
          cns.setActivationValue(node2.id, 70, function (err) {
            if (err) { return done(err); }
            cns.setActivationValue(node3.id, 50, function (err) {
              if (err) { return done(err); }
              cns.getMaximumActivationValue('s', function (err, maxValue) {
                assert.equal(maxValue, 70);
                done(err);
              });
            });
          });
        });
      });

      it('should return an error when getNodeFromId returns an error',
      function (done) {
        var mockCN = ConceptNetwork();
        var called = false;
        mockCN.getNodeFromId = function (nodeId, cb) {
          if (!called) {
            called = true;
            return cb(new Error('Does not work!'));
          }
          return;
        };
        var cnsErr = ConceptNetworkState(mockCN);
        mockCN.addNode("Node 1", function (err1, node1) {
          if (err1) { return done(err1); }
          mockCN.addNode("Node 2", function (err2, node2) {
            if (err2) { return done(err2); }
            mockCN.addLink(node1.id, node2.id, function (err3, link) {
              if (err3) { return done(err3); }
              cnsErr.activate(node1.id, function (err4) {
                if (err4) { return done(err4); }
                var doneCalled = false;
                cnsErr.getMaximumActivationValue('t',function (err5) {
                  if (!doneCalled) {
                    assert.deepEqual(err5, Error('Does not work!'));
                    done();
                    doneCalled = true;
                  }
                });
              });
            });
          });
        });
      });

    });

    describe('##getActivatedTypedNodes', function () {

      before(function (done) {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        cn.addNode("Node 1", function (err, node) {
          if (err) { return done(err); }
          node1 = node;
          cn.addNode("sNode 2", function (err, node) {
            if (err) { return done(err); }
            node2 = node;
            cn.addNode("tNode 3", function (err, node) {
              node3 = node;
              done(err);
            });
          });
        });
      });

      it('should return an empty array', function (done) {
        cns.getActivatedTypedNodes(function (err, activatedNodes) {
          assert.deepEqual(activatedNodes, []);
          done(err);
        });
      });

      it('should return one-node-array', function (done) {
        cns.setActivationValue(node1.id, 100, function (err) {
          if (err) { return done(err); }
          cns.getActivatedTypedNodes(function (err, result) {
            assert.deepEqual(result,
              [{"node": {"id": 1, "label": "Node 1", "occ": 1},
                "activationValue": 100}]);
            done(err);
          });
        });
      });

      it('should return two-nodes-array', function (done) {
        cns.setActivationValue(node2.id, 95, function (err) {
          if (err) { return done(err); }
          cns.getActivatedTypedNodes(function (err, result) {
            assert.deepEqual(result,
              [{"node": {"id": 1, "label": "Node 1", "occ": 1},
                "activationValue": 100},
               {"node": {"id": 2, "label": "sNode 2", "occ": 1},
                "activationValue": 95}
              ]);
            done(err);
          });
        });
      });

      it('should return one-node-array of type s', function (done) {
        cns.setActivationValue(node2.id, 95, function (err) {
          if (err) { return done(err); }
          cns.getActivatedTypedNodes('s', function (err, result) {
            assert.deepEqual(result,
              [{"node": {"id": 2, "label": "sNode 2", "occ": 1},
                "activationValue": 95}
              ]);
            done(err);
          });
        });
      });

      it('should return one-node-array where threshold = 96', function (done) {
        cns.setActivationValue(node1.id, 100, function (err) {
          if (err) { return done(err); }
          cns.getActivatedTypedNodes('', 96, function (err, result) {
            assert.deepEqual(result,
              [{"node": {"id": 1, "label": "Node 1", "occ": 1},
                "activationValue": 100}]);
            done(err);
          });
        });
      });

      it('should return an error when getNodeFromId returns an error',
      function (done) {
        var mockCN = ConceptNetwork();
        var called = false;
        mockCN.getNodeFromId = function (nodeId, cb) {
          if (!called) {
            called = true;
            return cb(new Error('Does not work!'));
          }
          return;
        };
        var cnsErr = ConceptNetworkState(mockCN);
        mockCN.addNode("Node 1", function (err1, node1) {
          if (err1) { return done(err1); }
          mockCN.addNode("Node 2", function (err2, node2) {
            if (err2) { return done(err2); }
            mockCN.addLink(node1.id, node2.id, function (err3, link) {
              if (err3) { return done(err3); }
              cnsErr.activate(node1.id, function (err4) {
                if (err4) { return done(err4); }
                var doneCalled = false;
                cnsErr.getActivatedTypedNodes('t',function (err5) {
                  if (!doneCalled) {
                    assert.deepEqual(err5, Error('Does not work!'));
                    done();
                    doneCalled = true;
                  }
                });
              });
            });
          });
        });
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

      before(function (done) {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        cn.addNode("Node 1", function (err, node) {
          if (err) { return done(err); }
          node1 = node;
          cn.addNode("Node 2", function (err, node) {
            node2 = node;
            done(err);
          });
        });
      });

      it('should set a zero activation value', function (done) {
        cns.setActivationValue(node2.id, 0, function (err) {
          if (err) { return done(err); }
          cns.getActivationValue(node2.id, function (err, activationValue) {
            assert.deepEqual(activationValue, 0);
            done(err);
          });
        });
      });

      it('should set a 75 activation value', function (done) {
        cns.setActivationValue(node1.id, 75, function (err) {
          if (err) { return done(err); }
          cns.getActivationValue(node1.id, function (err, activationValue) {
            assert.deepEqual(activationValue, 75);
            done(err);
          });
        });
      });

    });
  });

  describe('#propagate', function () {

    var cn, cns, node1, node2;
    before(function (done) {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      cn.addNode("Node 1", function (err, node) {
        if (err) { return done(err); }
        node1 = node;
        cn.addNode("Node 2", function (err, node) {
          if (err) { return done(err); }
          node2 = node;
          cn.addLink(node1.id, node2.id, done);
        });
      });
    });

    it('should deactivate node without afferent links', function (done) {
      cns.activate(node1.id, function (err, node) {
        if (err) { return done(err); }
        cns.getActivationValue(node1.id, function (err, value) {
          if (err) { return done(err); }
          assert.equal(value, 100);
          cns.propagate(function (err) {
            if (err) { return done(err); }
            cns.getActivationValue(node1.id, function (err, value) {
              assert.equal(value < 100, true);
              done(err);
            });
          });
        });
      });
    });

    it('should activate node 2', function (done) {
      cns.getActivationValue(node2.id, function (err, value) {
        assert.equal(value > 0, true);
        done(err);
      });
    });

    it('should accept options', function () {
      assert.doesNotThrow(function () {
        cns.propagate({anything: 1});
      },
      null,
      "unexpected error");
    });

    it('should take decay into account', function (done) {
      cns.propagate({decay: 200}, function (err) {
        if (err) { return done(err); }
        cns.getActiveNumber(function (err2, number) {
          assert.equal(number, 0, 'all nodes should be deactivated');
          done(err);
        });
      });
    });

    it('should take memoryPerf into account', function (done) {
      cns.activate(node1.id, function (err) {
        if (err) { return done(err); }
        cns.propagate({memoryPerf: Infinity}, function (err) {
          assert.equal(cns.getActivationValue(node1.id), 60,
            'with an infinite memory perf, ' +
            'activation should not decay too much');
          done(err);
        });
      });
    });

    it('should throw when first parameter is not an object', function (done) {
      assert.throws(function () {
          cns.propagate(1);
        }, /should be an object/
      );
      done();
    });

    it('should use already existing influenceValue', function (done) {
      var node3;
      cn.addNode("Node 3", function (err, node) {
        if (err) { return done(err); }
        node3 = node;
        cn.addLink(node3.id, node2.id, function (err) {
          if (err) { return done(err); }
          cns.activate(node1.id, function (err) {
            if (err) { return done(err); }
            cns.propagate(done);
          });
        });
      });
    });

    it('should return an error when getNodes returns an error',
    function (done) {
      var mockCN = ConceptNetwork ();
      mockCN.getNodes = function (cb) {
        return cb(new Error('Does not work!'));
      };
      var cnsErr = ConceptNetworkState(mockCN);
      mockCN.addNode("Node 1", function (err1, node1) {
        if (err1) { return done(err1); }
        mockCN.addNode("Node 2", function (err2, node2) {
          if (err2) { return done(err2); }
          mockCN.addLink(node1.id, node2.id, function (err3) {
            if (err3) { return done(err3); }
            cnsErr.propagate(function (err) {
              assert.deepEqual(err, Error('Does not work!'));
              done();
            });
          });
        });
      });
    });

    it('should return an error when getLink returns an error', function (done) {
      var mockCN = ConceptNetwork();
      var called = false;
      mockCN.getLink = function (linkId, cb) {
        if (!called) {
          called = true;
          return cb(new Error('Does not work!'));
        }
        return;
      };
      var cnsErr = ConceptNetworkState(mockCN);
      mockCN.addNode("Node 1", function (err1, node1) {
        if (err1) { return done(err1); }
        mockCN.addNode("Node 2", function (err2, node2) {
          if (err2) { return done(err2); }
          mockCN.addLink(node1.id, node2.id, function (err3, link) {
            if (err3) { return done(err3); }
            cnsErr.activate(node1.id, function (err4) {
              if (err4) { return done(err4); }
              var doneCalled = false;
              cnsErr.propagate(function (err5) {
                if (!doneCalled) {
                  assert.deepEqual(err5, Error('Does not work!'));
                  done();
                  doneCalled = true;
                }
              });
            });
          });
        });
      });
    });

    it('should return an error when getNodeFromLinks returns an error',
    function (done) {
      var mockCN = ConceptNetwork();
      var called = false;
      mockCN.getNodeFromLinks = function (nodeId, cb) {
        if (!called) {
          called = true;
          return cb(new Error('Does not work!'));
        }
        return;
      };
      var cnsErr = ConceptNetworkState(mockCN);
      mockCN.addNode("Node 1", function (err1, node1) {
        if (err1) { return done(err1); }
        mockCN.addNode("Node 2", function (err2, node2) {
          if (err2) { return done(err2); }
          mockCN.addLink(node1.id, node2.id, function (err3, link) {
            if (err3) { return done(err3); }
            cnsErr.activate(node1.id, function (err4) {
              if (err4) { return done(err4); }
              var doneCalled = false;
              cnsErr.propagate(function (err5) {
                if (!doneCalled) {
                  assert.deepEqual(err5, Error('Does not work!'));
                  done();
                  doneCalled = true;
                }
              });
            });
          });
        });
      });
    });

  });

});
