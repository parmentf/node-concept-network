/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*
 * concept-network
 * https://github.com/francois/node-concept-network
 *
 * Copyright (c) 2012 François Parmentier
 * Licensed under the MIT license.
 */
"use strict";

/**
 * ## ConceptNetwork's constructor
 *
 * Use it to instanciate a Concept Network.
 **/
function ConceptNetwork() {
  if (!(this instanceof ConceptNetwork)) {
    return new ConceptNetwork();
  }

  this.node = {}; // id -> id, label, occ
  this.link = {}; // linkId -> fromId, toId, coOcc
  this.nodeLastId = 0;
  this.labelIndex = {}; // label -> id
  this.fromIndex  = {}; // fromId -> linkId
  this.toIndex    = {}; // toId   -> linkId


  // private
  // Remove the link which @linkId is given from the ConceptNetwork.
  // Also remove the linkId from fromIndex and toIndex.
  this.removeLink = function removeLink(linkId) {
    var link = this.link[linkId];
    delete this.fromIndex[link.fromId];
    delete this.toIndex[link.toId];
    delete this.link[linkId];
  };

  // GET /node/:id
  this.getNode = function getNode(req, res) {
    var id = req.uriParams.id;
    if (typeof this.node[id] === 'undefined') {
      res.send(404, null);
      return;
    }
    res.send(200, this.node[id]);
  };

  // POST /node
  this.postNode = function postNode(req, res) {
    var label = req.uriParams.label;
    var modif = (req.uriParams.del ? -1 : +1);
    var id;
    var httpCode;
    // node already exists
    if (this.labelIndex.hasOwnProperty(label)) {
      id = this.labelIndex[label];
      httpCode = 200;
      this.node[id].occ += modif;
      if (this.node[id].occ === 0) {
        this.removeNode(id);
        res.send(httpCode, null);
        return;
      }
    } else if (modif > 0) {
      this.nodeLastId += 1;
      id = this.nodeLastId;
      httpCode = 201; // node created
      this.node[id] = {
        id: id,
        label: label,
        occ: 1
      };
      this.labelIndex[label] = id;
    } else {
      this.removeNode(id);
      res.send(httpCode, null);
      return;
    }
    res.send(httpCode, this.node[id]);
  };

  // GET /link/:from_id/:to_id
  this.getLink = function getLink(req, res) {
    var fromId = req.uriParams.from_id;
    var toId   = req.uriParams.to_id;
    var linkId = fromId + '_' + toId;
    if (typeof this.link[linkId] === 'undefined') {
      res.send(404, null);
      return;
    }
    res.send(200, this.link[linkId]);
  };

  // POST /link/:from_id/:to_id
  this.postLink = function postLink(req, res) {
    var fromId = req.uriParams.from_id;
    var toId   = req.uriParams.to_id;
    var modif = (req.uriParams.del ? -1 : +1);
    var linkId = fromId + '_' + toId;
    var httpCode;
    if (typeof this.link[linkId] === 'undefined') {
      // link created
      httpCode = 201;
      this.link[linkId] = {
        fromId : fromId,
        toId   : toId,
        coOcc  : 1
      };
      // fromIndex
      if (!this.fromIndex.hasOwnProperty(fromId)) {
        this.fromIndex[fromId] = [];
      }
      this.fromIndex[fromId].push(linkId);
      // toIndex
      if (!this.toIndex.hasOwnProperty(toId)) {
        this.toIndex[toId] = [];
      }
      this.toIndex[toId].push(linkId);
    } else {
      httpCode = 200;
      this.link[linkId].coOcc += modif;
    }
    res.send(httpCode, this.link[linkId]);
  };
}

// ## ConceptNetwork's methods
ConceptNetwork.prototype = {
  /**
   * ### addNode
   *
   * @this ConceptNetwork
   * @param {string} label Symbol for the node
   * @return {Object} {id, label, occ} id = identifier, occ = occurrence
   **/
  addNode : function (label) {
    var id;
    // node already exists
    if (this.labelIndex.hasOwnProperty(label)) {
      id = this.labelIndex[label];
      this.node[id].occ += 1;
    } else {
      this.nodeLastId += 1;
      id = this.nodeLastId;
      this.node[id] = {
        id: id,
        label: label,
        occ: 1
      };
      this.labelIndex[label] = id;
    }
    return this.node[id];
  },

  /**
   * ### decrementNode
   *
   * Decrement the occurrence of a node. Remove it if its counts down to zero.
   * @param {string} label identifier of the node.
   * @return {Object} the modified node. Or `null` if it has been removed.
   **/
  decrementNode : function (label) {
    var id;
    // node already exists
    if (this.labelIndex.hasOwnProperty(label)) {
      id = this.labelIndex[label];
      this.node[id].occ -= 1;
      if (this.node[id].occ === 0) {
        this.removeNode(id);
        return null;
      }
    } else {
      return null;
    }
    return this.node[id];
  },

  /**
   * ### removeNode
   *
   * _Private_
   *
   * Remove the node which *id* is given from the ConceptNetwork.
   * Also remove the links from and to this node.
   * Also remove the node from the *labelIndex*.
   * @param {Number} id Identifier of the node
   **/
  removeNode : function (id) {
    var linksToRemove = [];
    var i;
    // remove links from id
    if (this.fromIndex[id]) {
      for (i = 0; i < this.fromIndex[id].length; i += 1) {
        linksToRemove.push(this.fromIndex[id][i]);
      }
    }
    // remove links to id
    if (this.toIndex[id]) {
      for (i = 0; i < this.toIndex[id].length; i += 1) {
        linksToRemove.push(this.toIndex[id][i]);
      }
    }
    for (i = 0; i < linksToRemove.length; i += 1) {
      this.removeLink(linksToRemove[i]);
    }
    // remove from the labelIndex and from the node array.
    var label = this.node[id].label;
    delete this.node[id];
    delete this.labelIndex[label];
  }

};

module.exports = ConceptNetwork;