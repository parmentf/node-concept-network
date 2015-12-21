/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*
 * concept-network
 * https://github.com/parmentf/node-concept-network
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

}

// ## ConceptNetwork's methods
ConceptNetwork.prototype = {
  /**
   * ### addNode
   *
   * @this ConceptNetwork
   * @param {string}   label Symbol for the node
   * @param {number}   inc   Increment (Optional, 1 by default)
   * @param {Function} cb    f(err, {id, label, occ})
   *                         id = identifier, occ = occurrence
   **/
  addNode : function (label, inc, cb) {
    var id;
    if (!cb) {
      cb  = inc;
      inc = 1;
    }
    else {
      inc = inc || 1;
    }
    // node already exists
    if (this.labelIndex.hasOwnProperty(label)) {
      id = this.labelIndex[label];
      this.node[id].occ += inc;
    } else {
      this.nodeLastId += 1;
      id = this.nodeLastId;
      this.node[id] = {
        id: id,
        label: label,
        occ: inc
      };
      this.labelIndex[label] = id;
    }
    cb(null, this.node[id]);
  },

  /**
   * ### decrementNode
   *
   * Decrement the occurrence of a node. Remove it if its counts down to zero.
   * @param {string}   label identifier of the node.
   * @param {Function} cb    f(err, node) the modified node.
   *                         Or `null` if it has been removed.
   **/
  decrementNode : function (label, cb) {
    var id;
    // node already exists
    if (this.labelIndex.hasOwnProperty(label)) {
      id = this.labelIndex[label];
      this.node[id].occ -= 1;
      if (this.node[id].occ === 0) {
        this.removeNode(id, function (err) {
          return cb(null,null);
        });
        return;
      }
    } else {
      return cb(null,null);
    }
    cb(null, this.node[id]);
  },

  /**
   * ### removeNode
   *
   * _Private_
   *
   * Remove the node which *id* is given from the ConceptNetwork.
   * Also remove the links from and to this node.
   * Also remove the node from the *labelIndex*.
   * @param {Number}   id Identifier of the node
   * @param {Function} cb f(err)
   **/
  removeNode : function (id, cb) {
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
      this.removeLink(linksToRemove[i], function (err) {
      });
    }
    // remove from the labelIndex and from the node array.
    var label = this.node[id].label;
    delete this.node[id];
    delete this.labelIndex[label];
    cb();
  },

  /**
   * ### addLink
   *
   * Add a link between fromId and toId
   * @param {Number}   fromId Identifier of the afferent node
   * @param {Number}   toId   Identifier of the efferent node
   * @param {Number}   inc    Increment (optional, 1 by default)
   * @param {Function} cb     f(err, link)
   *                          the added link {fromId, toId, coOcc}
   **/
  addLink : function (fromId, toId, inc, cb) {
    if (!cb) {
      cb = inc;
      inc = 1;
    }
    else {
      inc = inc || 1;
    }
    if (typeof fromId !== 'number') {
      return cb(new Error('fromId should be a number'), null);
    }
    if (typeof toId !== 'number') {
      return cb(new Error('toId should be a number'), null);
    }
    var linkId = fromId + '_' + toId;
    // Link does not exist yet
    if (typeof this.link[linkId] === 'undefined') {
      this.link[linkId] = {
        fromId : fromId,
        toId   : toId,
        coOcc  : inc
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
      this.link[linkId].coOcc += inc;
    }
    return cb(null, this.link[linkId]);
  },

  /**
   * ### decrementLink
   *
   * Decrement the coOcc of a link.
   *
   * *linkId* is a string composed of fromNodeId + "_" + toNodeId
   *
   * @param {string}   linkId Identifier of the link to change
   * @param {Function} cb     f(err, link)
   *                          the modified link
   **/
  decrementLink : function (linkId, cb) {
    var link = this.link[linkId];
    link.coOcc -= 1;
    if (link.coOcc === 0) {
      return this.removeLink(linkId, cb);
    }
    return cb(null, link);
  },

  /**
   * ### removeLink
   *
   * {Private}
   *
   * Remove the link which *linkId* is given from the ConceptNetwork.
   *
   * Also remove the *linkId* from *fromIndex* and *toIndex*.
   *
   * @param {string}   linkId Identifier of the link
   * @param {Function} cb     f(err)
   **/
  removeLink : function (fromId, toId, cb) {
    var linkId;
    if (!cb) {
      linkId = fromId;
      cb = toId;
    }
    else {
      linkId = this.getLinkIdSync(fromId, toId);
    }
    var link = this.link[linkId];
    delete this.fromIndex[link.fromId];
    delete this.toIndex[link.toId];
    delete this.link[linkId];
    cb(null);
  },

  /**
   * ### getNode
   *
   * Get the node from its label
   * @param {string} label Label of the node to get
   * @param {Function} cb f(err, node)
   *                      the node {id, label, occ}
   **/
  getNode : function (label, cb) {
    var id = this.labelIndex[label];
    if (typeof this.node[id] === 'undefined') {
      return cb(new Error("This node does not exist"), null);
    }
    return cb(null, this.node[id]);
  },

  /**
   * ### getLinkIdSync
   *
   * Get the linkId matching fromId and toId. Synchronously.
   * @param  {string} fromId Afferent node
   * @param  {string} toId   Efferent node
   * @return {string}        Link ID.
   */
  getLinkIdSync : function (fromId, toId) {
    return fromId + '_' + toId;
  },

  /**
   * ### getLink
   *
   * Get the link from its node ids.
   * @param {string}   linkId Identifier of the link
   * @param {Function} cb     f(err, link)
   *                          found link {fromId, toId, coOcc}
   **/
  getLink : function (fromId, toId, cb) {
    var linkId;
    if (!cb) {
      linkId = fromId;
      cb = toId;
    }
    else {
      linkId = this.getLinkIdSync(fromId, toId);
    }
    if (typeof this.link[linkId] === 'undefined') {
      return cb(new Error("Link not found"), null);
    }
    return cb(null, this.link[linkId]);
  },

  /**
   * ### getNodeFromLinks
   *
   * Get the array of links ids for all links going from node *id*.
   * @param {Number}   id Identifier of the node.
   * @param {Function} cb f(err, links)
   *                      {Array} [linkId1, linkId2] or []
   **/
  getNodeFromLinks : function (id, cb) {
    var fromLinks = this.fromIndex[id];
    if (typeof fromLinks === 'undefined') {
      return cb(null, []);
    }
    return cb(null, fromLinks);
  },

  /**
   * ### getNodeToLinks
   *
   * Get the array of links ids for all links going to node *id*.
   * @param {Number}   id Identifier of the node.
   * @param {Function} cb f(err, links)
   *                      {Array} [linkId1, linkId2] or []
   **/
  getNodeToLinks : function (id, cb) {
    var toLinks = this.toIndex[id];
    if (typeof toLinks === 'undefined') {
      return cb(null, []);
    }
    return cb(null, toLinks);
  }

};

module.exports.ConceptNetwork = ConceptNetwork;
