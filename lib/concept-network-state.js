/*jshint node:true, maxlen:80, curly: true, eqeqeq: true, immed: true,
 latedef: true, newcap: true, noarg: true, sub: true, undef: true,
 eqnull: true, laxcomma: true, indent: 2, white:true */
 /*
 * concept-network-state
 * https://github.com/francois/node-concept-network
 *
 * Copyright (c) 2012 François Parmentier
 * Licensed under the MIT license.
 */
"use strict";

var debug = require('debug')('concept-network-state');

var ConceptNetwork = require('../index').ConceptNetwork;

/**
 * ## ConceptNetworkState's constructor
 *
 * The state of a concept network is bound to a user.
 *
 * @param {ConceptNetwork} cn The concept network of which it is a state.
 **/
function ConceptNetworkState(cn) {
  if (!(this instanceof ConceptNetworkState)) {
    return new ConceptNetworkState();
  }

  this.nodeState = {}; // nodeId -> {activationValue, oldActivationValue, age}
  // this.activationValue = [];  // nodeId -> activation value
  // this.oldActivationValue = [];
  // this.age = []; // nodeId -> age
  this.cn = cn;
  if (!(cn instanceof ConceptNetwork)) {
    throw new Error("Parameter is required");
  }
  this.normalNumberComingLinks = 2;
}

// ## ConceptNetworkState's methods
ConceptNetworkState.prototype = {

  /**
   * ### activate
   *
   * Activate the value of the node, which nodeId is given
   * @param {Number} nodeId Identifier of the node to activate
   **/
  activate : function (nodeId) {
    if (typeof this.nodeState[nodeId] === 'undefined') {
      this.nodeState[nodeId] = {
        activationValue: 100,
        age: 0,
        oldActivationValue: 0
      };
    }
    else {
      this.nodeState[nodeId].activationValue = 100;
    }
  },

  /**
   * ### getActivationValue
   * @param {Number} nodeId Identifier of the node
   * @return {Number} the activation value (in [0,100])
   **/
  getActivationValue : function (nodeId) {
    if (typeof this.nodeState[nodeId] === 'undefined') {
      return 0;
    }
    else {
      return this.nodeState[nodeId].activationValue;
    }
  },

  /**
   * ### setActivationValue
   * @param {Number} nodeId Identifier of the node
   * @param {Number} value new activation value
   * @return {Number} the activation value (in [0,100])
   **/
  setActivationValue : function (nodeId, value) {
    debug('this.nodeState', this.nodeState);
    debug('nodeId', nodeId);
    debug('value', value);
    if (typeof this.nodeState[nodeId] === 'undefined') {
      this.nodeState[nodeId] = {
        activationValue: value,
        age: 0,
        oldActivationValue: 0
      };
    }
    else {
      this.nodeState[nodeId].activationValue = value;
    }
    // Reactivate non-activated nodes.
    if (!value) {
      delete this.nodeState[nodeId];
    }
  },

  /**
   * ### getOldActivationValue
   * @param {Number} nodeId Identifier of the node
   * @return {Number} the activation value (in [0,100])
   **/
  getOldActivationValue : function (nodeId) {
    if (typeof this.nodeState[nodeId] === 'undefined') {
      return 0;
    }
    else {
      return this.nodeState[nodeId].oldActivationValue;
    }
  },

  /**
   * ### propagate
   *
   * Propagate the activation values along the links.
   **/
  propagate : function () {
    var influenceNb = [];    // nodeId -> nb of influence number
    var influenceValue = []; // nodeId -> influence value
    for (var nodeId in this.nodeState) {
      this.nodeState[nodeId].age += 1;
      this.nodeState[nodeId].oldActivationValue =
        this.nodeState[nodeId].activationValue;
    }
    // #### Fill influence table
    // Get the nodes influenced by others
    for (nodeId in this.cn.node) {
      var ov = this.getOldActivationValue(nodeId);
      var links = this.cn.getNodeFromLinks(nodeId);
      debug('links', links);
      // for all outgoing links
      for (var linkIndex in links) {
        debug('linkIndex', linkIndex);
        var linkId = links[linkIndex];
        debug('linkId', linkId);
        var link = this.cn.getLink(linkId);
        debug('link', link);
        var nodeToId = link.toId;
        var infl = typeof influenceValue[nodeToId] !== "undefined" ?
                    influenceValue[nodeToId] : 0;
        infl += 0.5 + ov * link.coOcc;
        influenceValue[nodeToId] = infl;
        influenceNb[nodeToId] = typeof influenceNb[nodeToId] !== "undefined" ?
                              influenceNb[nodeToId] : 0;
        influenceNb[nodeToId] += 1;
      }
    }
    debug('influenceNb', influenceNb);
    debug('influenceValue', influenceValue);
    // For all the nodes in the state
    for (nodeId in this.cn.node) {
      var nodeState = this.nodeState[nodeId];
      if (typeof nodeState === 'undefined') {
        nodeState = { activationValue: 0, oldActivationValue: 0, age: 0 };
      }
      var decay = 40;
      var memoryPerf = 100;
      var minusAge = 200 / (1 + Math.exp(-nodeState.age / memoryPerf)) - 100;
      var newActivationValue;
      // If this node is not influenced at all
      if (typeof influenceValue[nodeId] === 'undefined' ||
          !influenceValue[nodeId]) {
        newActivationValue = nodeState.oldActivationValue -
                             decay * nodeState.oldActivationValue / 100 -
                             minusAge;
      }
      // If this node receives influence
      else {
        var influence = influenceValue[nodeId];
        var nbIncomings = influenceNb[nodeId];
        influence /= Math.log(this.normalNumberComingLinks + nbIncomings) /
                     Math.log(this.normalNumberComingLinks);
        newActivationValue = nodeState.oldActivationValue -
                             decay * nodeState.oldActivationValue / 100 +
                             influence -
                             minusAge;
      }
      newActivationValue = Math.max(newActivationValue, 0);
      newActivationValue = Math.min(newActivationValue, 100);
      this.setActivationValue(nodeId, newActivationValue);
    }
  }
};

module.exports.ConceptNetworkState = ConceptNetworkState;
