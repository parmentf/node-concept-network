/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
/*global describe:true, it:true, before:true */
"use strict";

// # Tests for concept-network module

// ## Required libraries
var assert = require('assert');

// Module to test
var ConceptNetwork = require('../lib/concept-network').ConceptNetwork;

// ## ConceptNetwork
describe('ConceptNetwork', function () {
  // ### Constructor
  describe('#Constructor', function () {
    it('should not throw an exception', function () {
      assert.doesNotThrow(function () {
        var cn = new ConceptNetwork();
      }, null, "unexpected error");
    });
  });

  var cn;
  // ### addNode
  describe('#addNode', function () {

    before(function () {
      cn = new ConceptNetwork();
    });

    it('should return an object', function (done) {
      cn.addNode("Chuck Norris", function (err, node) {
        assert.equal(node.id, 1);
        assert.equal(node.label, "Chuck Norris");
        assert.equal(node.occ, 1);
        done(err);
      });
    });

    it('should increment occ', function (done) {
      cn.addNode("Chuck Norris", function (err, node) {
        assert.equal(node.id, 1);
        assert.equal(node.occ, 2);
        done(err);
      });
    });

    it('should increment nodeLastId', function (done) {
      cn.addNode("World", function (err, node) {
        assert.equal(node.id, 2);
        assert.equal(Object.getOwnPropertyNames(cn.node).length, 2);
        done(err);
      });
    });

    it('should increment a previous node too', function (done) {
      cn.addNode("Chuck Norris", function (err, node) {
        assert.equal(node.id, 1);
        assert.equal(node.occ, 3);
        done(err);
      });
    });

    it('should increment more than one', function (done) {
      cn.addNode("Steven Seagal",3, function (err, node) {
        assert.equal(node.id, 3);
        assert.equal(node.occ, 3);
        done(err);
      });
    });
  });

  // ### decrementNode
  describe('#decrementNode', function () {

    it('should decrement a node with occ of 3', function (done) {
      cn.decrementNode("Chuck Norris", function (err, node) {
        assert.equal(node.id, 1);
        assert.equal(node.occ, 2);
        done(err);
      });
    });

    it('should remove a node with an occ of 1', function (done) {
      cn.decrementNode("World", function (err, node) {
        assert.equal(node, null);
        done(err);
      });
    });
  });

  // ### removeNode
  describe('#removeNode', function () {

    it('should remove even a node with occ value of 2', function (done) {
      assert.equal(cn.node[1].occ, 2);
      cn.removeNode(1, function (err) {
        assert.equal(typeof cn.node[1], "undefined");
        done(err);
      });
    });

    it('should remove the links from the removed node');
    it('should remove the links to the removed node');

  });

  describe("#addLink", function () {

    before(function (done) {
      cn = new ConceptNetwork();
      cn.addNode("Node 1", function (err1, node1) {
        if (err1) { return done(err1); }
        cn.addNode("Node 2", function (err2, node2) {
          if (err2) { return done(err2); }
          cn.addNode("Node 3", function (err3, node3) {
            done(err3);
          });
        });
      });
    });

    it('should return an object', function (done) {
      cn.addLink(1, 2, function (err, link) {
        assert.equal(typeof link, "object");
        assert.equal(link.coOcc, 1);
        done(err);
      });
    });

    it('should increment coOcc', function (done) {
      cn.addLink(1, 2, function (err, link) {
        assert.equal(link.coOcc, 2);
        done(err);
      });
    });

    it('should increment with more than 1', function (done) {
      cn.addLink(1, 2, 4, function (err, link) {
        assert.equal(link.coOcc, 6);
        done(err);
      });
    });

    it('should create a good fromIndex', function (done) {
      cn.addLink(1, 3, function (err, link) {
        assert.deepEqual(cn.fromIndex[1], [ '1_2', '1_3']);
        done(err);
      });
    });

    it('should not accept non number ids', function (done) {
      cn.addLink(1, "berf", function (err, link) {
        assert.equal(err instanceof Error, true);
        cn.addLink("barf", 2, function (err, link) {
          assert.equal(err instanceof Error, true);
          done();
        });
      });
    });

  });

  describe("#decrementLink", function () {

    before(function (done) {
      cn = new ConceptNetwork();
      cn.addNode("Node 1", function (err) {
        if (err) { return done(err); }
        cn.addNode("Node 2", function (err) {
          if (err) { return done(err); }
          cn.addLink(1, 2, function (err) {
            if (err) { return done(err); }
            cn.addLink(1, 2, function (err) {
              done(err);
            });
          });
        });
      });
    });

    it('should decrement a coOcc value of 2', function (done) {
      assert.equal(cn.link['1_2'].coOcc, 2);
      cn.decrementLink('1_2', function (err, link) {
        assert.equal(cn.link['1_2'].coOcc, 1);
        done(err);
      });
    });

    it('should remove a link with a coOcc value of 0', function (done) {
      assert.equal(cn.link['1_2'].coOcc, 1);
      cn.decrementLink('1_2', function (err) {
        assert.equal(typeof cn.link['1_2'], "undefined");
        done();
      });
    });

  });

  describe("#removeLink", function () {

    before(function (done) {
      cn = new ConceptNetwork();
      cn.addNode("Node 1", function (err) {
        if (err) { return done (err); }
        cn.addNode("Node 2", function (err) {
          cn.addLink(1, 2, function (err) {
            done(err);
          });
        });
      });
    });

    it('should remove the link', function (done) {
      assert.deepEqual(cn.link['1_2'], { fromId: 1, toId: 2, coOcc: 1 });
      cn.removeLink('1_2', function (err) {
        assert.equal(typeof cn.link['1_2'], "undefined");
        done(err);
      });
    });
  });

  describe('#getters', function () {

    before(function (done) {
      cn = new ConceptNetwork();
      cn.addNode("Node 1", function (err) {
        if (err) { return done(err); }
        cn.addNode("Node 2", function (err) {
          if (err) { return done(err); }
          cn.addNode("Node 3", function (err) {
            if (err) { return done(err); }
            cn.addLink(1, 2, function (err) {
              if (err) { return done(err); }
              cn.addLink(1, 3, function (err) {
                if (err) { return done(err); }
                cn.addLink(2, 3, function (err) {
                  done(err);
                });
              });
            });
          });
        });
      });
    });

    describe('#getNode', function () {

      it('should get the second node', function (done) {
        cn.getNode('Node 2', function (err, node) {
          assert.equal(node.id, 2);
          done(err);
        });
      });

      it('should return null when the node does not exist', function (done) {
        cn.getNode('Nonexistent', function (err, node) {
          assert.equal(node, null);
          done();
        });
      });

    });

    describe('#getLink', function () {

      it('should get the link', function (done) {
        cn.getLink('1_2', function (err, link) {
          assert.equal(link.fromId, 1);
          assert.equal(link.toId, 2);
          assert.equal(link.coOcc, 1);
          done(err);
        });
      });

      it('should get the link with two parameters', function (done) {
        cn.getLink(1,2, function (err, link) {
          assert.equal(link.fromId, 1);
          assert.equal(link.toId, 2);
          assert.equal(link.coOcc, 1);
          done(err);
        });
      });

      it('should return null when the node does not exist', function (done) {
        cn.getLink('1_100', function (err, link) {
          assert.equal(link, null);
          done();
        });
      });

    });

    describe('#getNodeFromLinks', function () {

      it('should get all links from node 2', function (done) {
        cn.getNodeFromLinks(2, function (err, fromLinks) {
          assert.deepEqual(fromLinks, ['2_3']);
          done(err);
        });
      });

      it('should get all links from node 1', function (done) {
        cn.getNodeFromLinks(1, function (err, fromLinks) {
          assert.deepEqual(fromLinks, ['1_2', '1_3']);
          done(err);
        });
      });

      it('should get no links from node 3', function (done) {
        cn.getNodeFromLinks(3, function (err, fromLinks) {
          assert.deepEqual(fromLinks, []);
          done(err);
        });
      });

    });

    describe('#getNodeToLinks', function () {

      it('should get all links to node 2', function (done) {
        cn.getNodeToLinks(2, function (err, toLinks) {
          assert.deepEqual(toLinks, ['1_2']);
          done(err);
        });
      });

      it('should get all links to node 3', function (done) {
        cn.getNodeToLinks(3, function (err, toLinks) {
          assert.deepEqual(toLinks, ['1_3', '2_3']);
          done(err);
        });
      });

      it('should get no links to node 1', function (done) {
        cn.getNodeToLinks(1, function (err, toLinks) {
          assert.deepEqual(toLinks, []);
          done(err);
        });
      });

    });

  });

});
