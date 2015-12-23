/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*
 * concept-network-state
 * https://github.com/parmentf/node-concept-network
 *
 * Copyright (c) 2012 François Parmentier
 * Licensed under the MIT license.
 */
"use strict";

var debug = require('debug')('concept-network-state');
var ConceptNetwork = require('../index').ConceptNetwork;

var startsWith = require('./tools').startsWith;
var objectMax  = require('./tools').objectMax;



/**
 * ## ConceptNetworkState's factory
 *
 * The state of a concept network is bound to a user.
 *
 * @param {ConceptNetwork} conceptNetwork The concept network of which it is a
 *                                        state.
 **/
var ConceptNetworkState = function (conceptNetwork) {
  var nodeState = {}; // nodeId -> {activationValue, oldActivationValue, age}
  var cn = conceptNetwork;
  var normalNumberComingLinks = 2;
  if (!cn) {
    throw new Error("Parameter is required");
  }

  var self = {
    /**
     * ### activate
     *
     * Activate the value of the node, which nodeId is given
     * @param {Number}   nodeId Identifier of the node to activate
     * @param {Function} cb     f(err)
     **/
    activate : function (nodeId, cb) {
      if (typeof nodeState[nodeId] === 'undefined') {
        nodeState[nodeId] = {
          activationValue: 100,
          age: 0,
          oldActivationValue: 0
        };
      }
      else {
        nodeState[nodeId].activationValue = 100;
      }
      return cb(null, nodeState[nodeId]);
    },

    /**
     * ### getActivationValue
     * @param {Number}   nodeId Identifier of the node
     * @param {Function} cb     f(err, activationValue)
     *                          the activation value (in [0,100])
     **/
    getActivationValue : function (nodeId, cb) {
      if (typeof nodeState[nodeId] === 'undefined') {
        return cb ? cb(null, 0) : 0;
      }
      else {
        return cb ?
          cb(null, nodeState[nodeId].activationValue) :
          nodeState[nodeId].activationValue;
      }
    },

    /**
     * ### setActivationValue
     * @param {Number}   nodeId Identifier of the node
     * @param {Number}   value  new activation value
     * @param {Function} cb     f(err, value)
     *                          the activation value (in [0,100])
     **/
    setActivationValue : function (nodeId, value, cb) {
      debug('setActivationValue nodeState', nodeState);
      debug('nodeId', nodeId);
      debug('value', value);
      if (typeof nodeState[nodeId] === 'undefined') {
        nodeState[nodeId] = {
          activationValue: value,
          age: 0,
          oldActivationValue: 0
        };
      }
      else {
        nodeState[nodeId].activationValue = value;
      }
      // Reactivate non-activated nodes.
      if (!value) {
        delete nodeState[nodeId];
      }
      debug('setActivationValue nodeState2', nodeState);
      if (cb) { return cb(null, value); }
      return value;
    },

    /**
     * ### getOldActivationValue
     * @param {Number}    nodeId Identifier of the node
     * @param {Function}  cb     f(err, value)
     *                           the activation value (in [0,100])
     **/
    getOldActivationValue : function (nodeId, cb) {
      cb(null, nodeState[nodeId] ?
               nodeState[nodeId].oldActivationValue :
               0);
    },

    /**
     * ### getMaximumActivationValue
     * @param {string|regex} filter beginning of the node label to
     *                              take into account
     * @param {Functon}      cb     f(err, value)
     *                              the maximum activation value (in [0,100])
     **/
    getMaximumActivationValue : function (filter, cb) {
      if (!cb) {
        cb = filter;
        filter = undefined;
      }
      var max = 0;
      if (typeof filter === 'undefined') {
        var maxId = objectMax(nodeState, 'activationValue');
        if (typeof maxId === 'undefined') { return cb(null, 0); }
        max = nodeState[maxId].activationValue;
      }
      else {
        var id;
        var f = function (err, node) {
          if (startsWith(node.label,filter)) {
            max = Math.max(max, nodeState[id].activationValue);
          }
        };
        for (id in nodeState) {
          cn.getNodeFromId(id, f);
        }
      }
      cb (null, max);
    },

    /**
     * ### getActivatedTypedNodes
     *
     * Get the activated nodes of ConceptNetwork
     * @param {string}    filter beginning of the node label to
     *                           take into account
     * @param {Number}    threshold (default: 90)
     * @param {Function}  cb      f(err, nodeStates)
     *                            array of { node, activationValue }
     **/
    getActivatedTypedNodes : function (filter, threshold, cb) {
      var array = [];
      if (!cb) {
        if (typeof threshold === "function") {
          cb = threshold;
          threshold = undefined;
        }
        if (typeof filter === "function") {
          cb = filter;
          filter = undefined;
        }
      }
      if (typeof threshold === 'undefined') { threshold = 90; }
      if (typeof filter === 'undefined' || typeof filter !== 'string') {
       filter = '';
      }
      var id;
      var f = function (err, node) {
        var activationValue = self.getActivationValue(id);
        if (startsWith(node.label,filter)) {
          if (activationValue > threshold) {
            array.push({node: node, activationValue: activationValue});
          }
        }
      };
      for (id in nodeState) {
        cn.getNodeFromId(id, f);
      }
      return cb (null, array);
    },

    /**
     * ### propagate
     *
     * Propagate the activation values along the links.
     *
     * @param {Object}   options {decay,memoryPerf}
     * @param {Function} cb     f(err)
     **/
    propagate : function (options, cb) {
      debug('nodeState1', nodeState);
      var ov; // old value
      if (!cb && typeof options === 'function') {
        cb = options;
        options = {
          decay      : 40,
          memoryPerf : 100
        };
      }
      if (options && typeof options !== 'object') {
        throw new Error("propagate() parameter should be an object");
      }
      var influenceNb = [];    // nodeId -> nb of influence number
      var influenceValue = []; // nodeId -> influence value
      for (var nodeId in nodeState) {
        nodeState[nodeId].age += 1;
        nodeState[nodeId].oldActivationValue =
          nodeState[nodeId].activationValue;
      }
      debug('nodeState2', nodeState);
      var storeInfluencedNodes = function (err, links) {
        debug('links', links);
        var computeInfluence = function(err, link) {
          debug('link', link);
          var nodeToId = link.toId;
          var infl = typeof influenceValue[nodeToId] !== "undefined" ?
                      influenceValue[nodeToId] : 0;
          infl += 0.5 + ov * link.coOcc;
          influenceValue[nodeToId] = infl;
          influenceNb[nodeToId] = typeof influenceNb[nodeToId] !== "undefined" ?
                                  influenceNb[nodeToId] : 0;
          influenceNb[nodeToId] += 1;
        };
        // for all outgoing links
        for (var linkIndex in links) {
          debug('linkIndex', linkIndex);
          var linkId = links[linkIndex];
          debug('linkId', linkId);
          cn.getLink(linkId, computeInfluence);
        }
      };
      // #### Fill influence table
      // Get the nodes influenced by others
      cn.getNodes(function (err, nodes) {
        for (nodeId in nodes) {
          ov = nodeState[nodeId] ?
               nodeState[nodeId].oldActivationValue :
               0;
          cn.getNodeFromLinks(nodeId, storeInfluencedNodes);
        }
      });
      debug('influenceNb', influenceNb);
      debug('influenceValue', influenceValue);
      // For all the nodes in the state
      cn.getNodes(function (err, nodes) {
        if (err) { return cb(err); }
        for (nodeId in nodes) {
          var ns = nodeState[nodeId];
          debug('ns',ns, 'nodeId', nodeId);
          if (typeof ns === 'undefined') {
            ns = { activationValue: 0, oldActivationValue: 0, age: 0 };
          }
          var decay      = options.decay || 40;
          debug("decay",decay);
          var memoryPerf = options.memoryPerf || 100;
          var minusAge = 200 / (1 + Math.exp(-ns.age / memoryPerf)) - 100;
          var newActivationValue;
          // If this node is not influenced at all
          if (typeof influenceValue[nodeId] === 'undefined' ||
              !influenceValue[nodeId]) {
            newActivationValue = ns.oldActivationValue -
                                 decay * ns.oldActivationValue / 100 -
                                 minusAge;
          }
          // If this node receives influence
          else {
            var influence = influenceValue[nodeId];
            var nbIncomings = influenceNb[nodeId];
            influence /= Math.log(normalNumberComingLinks + nbIncomings) /
                         Math.log(normalNumberComingLinks);
            newActivationValue = ns.oldActivationValue -
                                 decay * ns.oldActivationValue / 100 +
                                 influence -
                                 minusAge;
            debug('newActivationValue', newActivationValue);
            debug('influence', influence);
            debug('nbIncomings', nbIncomings);
          }
          newActivationValue = Math.max(newActivationValue, 0);
          newActivationValue = Math.min(newActivationValue, 100);
          debug('newActivationValue2', newActivationValue);
          self.setActivationValue(nodeId, newActivationValue);
        }
        if (cb) { return cb(null); }
      });
    },

    getActiveNumber: function (cb) {
      return cb(null, Object.getOwnPropertyNames(nodeState).length);
    }
  };

  return self;
};

module.exports.ConceptNetworkState = ConceptNetworkState;
