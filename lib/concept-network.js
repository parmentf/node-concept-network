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

var ConceptNetwork = function () {
  var node = {}; // id -> id, label, occ
  var link = {}; // id -> id, label, occ
  var nodeLastId = 0;
  var labelIndex = {}; // label -> id
  var fromIndex  = {}; // fromId -> linkId
  var toIndex    = {}; // toId   -> linkId

  /**
   * ### getLinkIdSync
   *
   * Get the linkId matching fromId and toId. Synchronously.
   * @param  {string} fromId Afferent node
   * @param  {string} toId   Efferent node
   * @return {string}        Link ID.
   */
  var getLinkIdSync = function (fromId, toId) {
    return fromId + '_' + toId;
  };

  var self = {
    /**
     * ### addNode
     *
     * @this ConceptNetwork
     * @param {string}   label Symbol for the node
     * @param {number}   inc   Increment (Optional, 1 by default)
     * @param {Function} cb    f(err, {id, label, occ})
     *                         id = identifier, occ = occurrence
     **/
    addNode: function (label, inc, cb) {
      var id;
      if (!cb) {
        cb  = inc;
        inc = 1;
      }
      else {
        inc = inc || 1;
      }
      // node already exists
      if (labelIndex.hasOwnProperty(label)) {
        id = labelIndex[label];
        node[id].occ += inc;
      } else {
        nodeLastId += 1;
        id = nodeLastId;
        node[id] = {
          id: id,
          label: label,
          occ: inc
        };
        labelIndex[label] = id;
      }
      cb(null, node[id]);
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
      if (labelIndex.hasOwnProperty(label)) {
        id = labelIndex[label];
        node[id].occ -= 1;
        if (node[id].occ === 0) {
          self.removeNode(id, function (err) {
            return cb(null,null);
          });
          return;
        }
      } else {
        return cb(null,null);
      }
      cb(null, node[id]);
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
      if (fromIndex[id]) {
        for (i = 0; i < fromIndex[id].length; i += 1) {
          linksToRemove.push(fromIndex[id][i]);
        }
      }
      // remove links to id
      if (toIndex[id]) {
        for (i = 0; i < toIndex[id].length; i += 1) {
          linksToRemove.push(toIndex[id][i]);
        }
      }
      for (i = 0; i < linksToRemove.length; i += 1) {
        self.removeLink(linksToRemove[i], function (err) {
        });
      }
      // remove from the labelIndex and from the node array.
      var label = node[id].label;
      delete node[id];
      delete labelIndex[label];
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
      if (typeof link[linkId] === 'undefined') {
        link[linkId] = {
          fromId : fromId,
          toId   : toId,
          coOcc  : inc
        };
        // fromIndex
        if (!fromIndex.hasOwnProperty(fromId)) {
          fromIndex[fromId] = [];
        }
        fromIndex[fromId].push(linkId);
        // toIndex
        if (!toIndex.hasOwnProperty(toId)) {
          toIndex[toId] = [];
        }
        toIndex[toId].push(linkId);
      } else {
        link[linkId].coOcc += inc;
      }
      return cb(null, link[linkId]);
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
      var l = link[linkId];
      l.coOcc -= 1;
      if (l.coOcc === 0) {
        return self.removeLink(linkId, cb);
      }
      return cb(null, l);
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
        linkId = getLinkIdSync(fromId, toId);
      }
      var l = link[linkId];
      delete fromIndex[l.fromId];
      delete toIndex[l.toId];
      delete link[linkId];
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
      var id = labelIndex[label];
      if (typeof node[id] === 'undefined') {
        return cb(new Error("This node does not exist"), null);
      }
      return cb(null, node[id]);
    },

    /**
     * ### getNodeFromId
     *
     * Get the node from its id
     * @param {number}   id Identifier of the node to get
     * @param {Function} cb f(err, node)
     *                      the node {id, label, occ}
     **/
    getNodeFromId : function (id, cb) {
      if (typeof node[id] === 'undefined') {
        return cb(new Error("This node does not exist"), null);
      }
      return cb(null, node[id]);
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
        linkId = getLinkIdSync(fromId, toId);
      }
      if (typeof link[linkId] === 'undefined') {
        return cb(new Error("Link not found"), null);
      }
      return cb(null, link[linkId]);
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
      var fromLinks = fromIndex[id];
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
      var toLinks = toIndex[id];
      if (typeof toLinks === 'undefined') {
        return cb(null, []);
      }
      return cb(null, toLinks);
    },

    getNodeNumber: function (cb) {
      return cb(null, Object.getOwnPropertyNames(node).length);
    },

    getNodes: function (cb) {
      return cb(null, node);
    }

  };

  return self;
};

module.exports.ConceptNetwork = ConceptNetwork;
