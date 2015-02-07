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

    it('should return an object', function () {
      var node = cn.addNode("Chuck Norris");
      assert.equal(node.id, 1);
      assert.equal(node.label, "Chuck Norris");
      assert.equal(node.occ, 1);
    });

    it('should increment occ', function () {
      var node = cn.addNode("Chuck Norris");
      assert.equal(node.id, 1);
      assert.equal(node.occ, 2);
    });

    it('should increment nodeLastId', function () {
      var node = cn.addNode("World");
      assert.equal(node.id, 2);
      assert.equal(Object.getOwnPropertyNames(cn.node).length, 2);
    });

    it('should increment a previous node too', function () {
      var node = cn.addNode("Chuck Norris");
      assert.equal(node.id, 1);
      assert.equal(node.occ, 3);
    });

    it('should increment more than one', function () {
      var node = cn.addNode("Steven Seagal",3);
      assert.equal(node.id, 3);
      assert.equal(node.occ, 3);
    });
  });

  // ### decrementNode
  describe('#decrementNode', function () {

    it('should decrement a node with occ of 3', function () {
      var node = cn.decrementNode("Chuck Norris");
      assert.equal(node.id, 1);
      assert.equal(node.occ, 2);
    });

    it('should remove a node with an occ of 1', function () {
      var node = cn.decrementNode("World");
      assert.equal(node, null);
    });
  });

  // ### removeNode
  describe('#removeNode', function () {

    it('should remove even a node with occ value of 2', function () {
      assert.equal(cn.node[1].occ, 2);
      cn.removeNode(1);
      assert.equal(typeof cn.node[1], "undefined");
    });

  });

  describe("#addLink", function () {

    before(function () {
      cn = new ConceptNetwork();
      cn.addNode("Node 1");
      cn.addNode("Node 2");
      cn.addNode("Node 3");
    });

    it('should return an object', function () {
      var link = cn.addLink(1, 2);
      assert.equal(typeof link, "object");
      assert.equal(link.coOcc, 1);
    });

    it('should increment coOcc', function () {
      var link = cn.addLink(1, 2);
      assert.equal(link.coOcc, 2);
    });

    it('should increment with more than 1', function () {
      var link = cn.addLink(1, 2, 4);
      assert.equal(link.coOcc, 6);
    });

    it('should create a good fromIndex', function () {
      cn.addLink(1, 3);
      assert.deepEqual(cn.fromIndex[1], [ '1_2', '1_3']);
    });

    it('should not accept non number ids', function () {
      var link = cn.addLink(1, "berf");
      assert.equal(link instanceof Error, true);
      link = cn.addLink("barf", 2);
      assert.equal(link instanceof Error, true);
    });

  });

  describe("#decrementLink", function () {

    before(function () {
      cn = new ConceptNetwork();
      cn.addNode("Node 1");
      cn.addNode("Node 2");
      cn.addLink(1, 2);
      cn.addLink(1, 2);
    });

    it('should decrement a coOcc value of 2', function () {
      assert.equal(cn.link['1_2'].coOcc, 2);
      cn.decrementLink('1_2');
      assert.equal(cn.link['1_2'].coOcc, 1);
    });

    it('should remove a link with a coOcc value of 0', function () {
      assert.equal(cn.link['1_2'].coOcc, 1);
      cn.decrementLink('1_2');
      assert.equal(typeof cn.link['1_2'], "undefined");
    });

  });

  describe("#removeLink", function () {

    before(function () {
      cn = new ConceptNetwork();
      cn.addNode("Node 1");
      cn.addNode("Node 2");
      cn.addLink(1, 2);
    });

    it('should remove the link', function () {
      assert.deepEqual(cn.link['1_2'], { fromId: 1, toId: 2, coOcc: 1 });
      cn.removeLink('1_2');
      assert.equal(typeof cn.link['1_2'], "undefined");
    });
  });

  describe('#getters', function () {

    before(function () {
      cn = new ConceptNetwork();
      cn.addNode("Node 1");
      cn.addNode("Node 2");
      cn.addNode("Node 3");
      cn.addLink(1, 2);
      cn.addLink(1, 3);
      cn.addLink(2, 3);
    });

    describe('#getNode', function () {

      it('should get the second node', function () {
        var node = cn.getNode('Node 2');
        assert.equal(node.id, 2);
      });

      it('should return null when the node does not exist', function () {
        var node = cn.getNode('Nonexistent');
        assert.equal(node, null);
      });

    });

    describe('#getLink', function () {

      it('should get the link', function () {
        var link = cn.getLink('1_2');
        assert.equal(link.fromId, 1);
        assert.equal(link.toId, 2);
        assert.equal(link.coOcc, 1);
      });

      it('shoulg get the link with two parameters', function () {
        var link = cn.getLink(1,2);
        assert.equal(link.fromId, 1);
        assert.equal(link.toId, 2);
        assert.equal(link.coOcc, 1);
      });

      it('should return null when the node does not exist', function () {
        var link = cn.getLink('1_100');
        assert.equal(link, null);
      });

    });

    describe('#getNodeFromLinks', function () {

      it('should get all links from node 2', function () {
        var fromLinks = cn.getNodeFromLinks(2);
        assert.deepEqual(fromLinks, ['2_3']);
      });

      it('should get all links from node 1', function () {
        var fromLinks = cn.getNodeFromLinks(1);
        assert.deepEqual(fromLinks, ['1_2', '1_3']);
      });

      it('should get no links from node 3', function () {
        var fromLinks = cn.getNodeFromLinks(3);
        assert.deepEqual(fromLinks, []);
      });

    });

    describe('#getNodeToLinks', function () {

      it('should get all links to node 2', function () {
        var toLinks = cn.getNodeToLinks(2);
        assert.deepEqual(toLinks, ['1_2']);
      });

      it('should get all links to node 3', function () {
        var toLinks = cn.getNodeToLinks(3);
        assert.deepEqual(toLinks, ['1_3', '2_3']);
      });

      it('should get no links to node 1', function () {
        var toLinks = cn.getNodeToLinks(1);
        assert.deepEqual(toLinks, []);
      });

    });

  });

});
