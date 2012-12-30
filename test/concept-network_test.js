/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*global describe:true, it:true, before:true */
"use strict";

// # Tests for concept-network module

// ## Required libraries
var assert = require('assert');

// Module to test
var ConceptNetwork = require('../lib/concept-network');

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



});

var cn = new ConceptNetwork();

var res = {
  send: function (code, msg) {
    console.log(code + ':');
    console.log(msg);
  }
};
var req = { uriParams: { label: 'Test' } };

console.log('**** TESTS *****');
console.log('---- POST ----');

cn.postNode(req, res);
cn.postNode(req, res);

req = { uriParams: { label: 'Chuck Norris' } };
cn.postNode(req, res);

req = { uriParams: { label: 'World' } };
cn.postNode(req, res);

var reqL = { uriParams: { from_id: 1, to_id: 2 } };
cn.postLink(reqL, res);

reqL = { uriParams: { from_id: 2, to_id: 3 } };
cn.postLink(reqL, res);

console.log(cn);

console.log('---- GET ----');

req.uriParams.id = 2;
cn.getNode(req, res);

console.log('---- POST / DEL node ----');
req.uriParams.label = 'World';
req.uriParams.del = true;

cn.postNode(req, res);

console.log(cn);

console.log('---- POST / DEL link ----');
req.uriParams.del = false;

cn.postNode(req, res);

console.log(cn);