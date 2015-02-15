require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  if (!cn) {
    throw new Error("Parameter is required");
  }
  // else if (!(cn.name && cn.name === 'ConceptNetwork')) {
  //   throw new Error("Parameter has to be a ConceptNetwork");
  // }
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
   * ### getMaximumActivationValue
   * @param {string|regex} filter beginning of the node label to
   *                              take into account
   * @return {Number} the maximum activation value (in [0,100])
   **/
  getMaximumActivationValue : function (filter) {
    var max = 0;
    if (typeof filter === 'undefined') {
      var maxId = objectMax(this.nodeState, 'activationValue');
      if (typeof maxId === 'undefined') { return 0; }
      max = this.nodeState[maxId].activationValue;
    }
    else {
      for (var id in this.nodeState) {
        var node = this.cn.node[id];
        if (startsWith(node.label,filter)) {
          max = Math.max(max, this.nodeState[id].activationValue);
        }
      }
    }
    return max;
  },

  /**
   * ### getActivatedTypedNodes
   *
   * Get the activated nodes of ConceptNetwork
   * @param {string} filter beginning of the node label to
   *                        take into account
   * @param {Number} threshold (default: 90)
   * @return {Array} array of { node, activationValue }
   **/
  getActivatedTypedNodes : function (filter, threshold) {
    var array = [];
    if (typeof threshold === 'undefined') { threshold = 90; }
    if (typeof filter === 'undefined') { filter = ''; }
    for (var id in this.nodeState) {
      var node = this.cn.node[id];
      var activationValue = this.getActivationValue(id);
      if (startsWith(node.label,filter)) {
        if (activationValue > threshold) {
          array.push({node: node, activationValue: activationValue});
        }
      }
    }
    return array;
  },

  /**
   * ### propagate
   *
   * Propagate the activation values along the links.
   *
   * @param {Object} options {decay,memoryPerf}
   **/
  propagate : function (options) {
    if (options && typeof options !== 'object') {
      throw new Error("propagate() parameter should be an object");
    }
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
      if (!options) {
        options = {
          decay      : 40,
          memoryPerf : 100
        };
      }
      var decay      = options.decay || 40;
      var memoryPerf = options.memoryPerf || 100;
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

},{"../index":"concept-network","./tools":3,"debug":4}],2:[function(require,module,exports){
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
   * @param {string} label Symbol for the node
   * @param {number} inc   Increment (Optional, 1 by default)
   * @return {Object} {id, label, occ} id = identifier, occ = occurrence
   **/
  addNode : function (label, inc) {
    var id;
    inc = inc || 1;
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
  },

  /**
   * ### addLink
   *
   * Add a link between fromId and toId
   * @param {Number} fromId Identifier of the afferent node
   * @param {Number} toId   Identifier of the efferent node
   * @param {Number} inc    Increment (optional, 1 by default)
   * @return {Object} the added link {fromId, toId, coOcc}
   **/
  addLink : function (fromId, toId, inc) {
    inc = inc || 1;
    if (typeof fromId !== 'number') {
      return new Error('fromId should be a number');
    }
    if (typeof toId !== 'number') {
      return new Error('toId should be a number');
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
    return this.link[linkId];
  },

  /**
   * ### decrementLink
   *
   * Decrement the coOcc of a link.
   *
   * *linkId* is a string composed of fromNodeId + "_" + toNodeId
   *
   * @param {string} linkId Identifier of the link to change
   * @return {Object} the modified link
   **/
  decrementLink : function (linkId) {
    var link = this.link[linkId];
    link.coOcc -= 1;
    if (link.coOcc === 0) {
      this.removeLink(linkId);
    }
    return link;
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
   * @param {string} linkId Identifier of the link
   **/
  removeLink : function (linkId) {
    var link = this.link[linkId];
    delete this.fromIndex[link.fromId];
    delete this.toIndex[link.toId];
    delete this.link[linkId];
  },

  /**
   * ### getNode
   *
   * Get the node from its label
   * @param {string} label Label of the node to get
   * @return {Object} the node {id, label, occ}
   **/
  getNode : function (label) {
    var id = this.labelIndex[label];
    if (typeof this.node[id] === 'undefined') {
      return null;
    }
    return (this.node[id]);
  },

  /**
   * ### getLink
   *
   * Get the link from its node ids.
   * @param {string} linkId Identifier of the link
   * @return {Object} the found link {fromId, toId, coOcc}
   **/
  getLink : function (fromId, toId) {
    var linkId = toId ? fromId + '_' + toId : fromId;
    if (typeof this.link[linkId] === 'undefined') {
      return null;
    }
    return this.link[linkId];
  },

  /**
   * ### getNodeFromLinks
   *
   * Get the array of links ids for all links going from node *id*.
   * @param {Number} id Identifier of the node.
   * @return {Array} [linkId1, linkId2] or []
   **/
  getNodeFromLinks : function (id) {
    var fromLinks = this.fromIndex[id];
    if (typeof fromLinks === 'undefined') {
      return [];
    }
    return fromLinks;
  },

  /**
   * ### getNodeToLinks
   *
   * Get the array of links ids for all links going to node *id*.
   * @param {Number} id Identifier of the node.
   * @return {Array} [linkId1, linkId2] or []
   **/
  getNodeToLinks : function (id) {
    var toLinks = this.toIndex[id];
    if (typeof toLinks === 'undefined') {
      return [];
    }
    return toLinks;
  }

};

module.exports.ConceptNetwork = ConceptNetwork;

},{}],3:[function(require,module,exports){
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

var debug = require('debug')('tools');

/**
 * Return true if string1 starts with string2
 * @param  {String} string1 Longest string
 * @param  {String} string2 Shortest string
 * @return {Boolean}        true if string1 starts with string2
 */
module.exports.startsWith = function startsWith(string1, string2) {
  return  string1.length >= string2.length ?
          string1.slice(0,string2.length) === string2 :
          false;
};

/**
 * Return the object key for which the property is max
 * @param  {Object} obj      Object within to find the max value and id
 * @param  {String} property Name of the property to consider
 * @return {String}          Key of obj, for which property is max
 */
module.exports.objectMax = function objectMax(obj, property) {
  var max = null;
  var maxId;
  Object.keys(obj).forEach(function (key) {
    if (max < obj[key][property]) {
      max = obj[key][property];
      maxId = key;
    }
  });
  return maxId;
};

},{"debug":4}],4:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],"concept-network":[function(require,module,exports){
module.exports.ConceptNetwork = require('./lib/concept-network').ConceptNetwork;
module.exports.ConceptNetworkState = require('./lib/concept-network-state').ConceptNetworkState;

},{"./lib/concept-network":2,"./lib/concept-network-state":1}]},{},[]);
