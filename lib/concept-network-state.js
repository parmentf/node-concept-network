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

/**
 * ## ConceptNetworkState's constructor
 *
 * The state of a concept network is bound to a user.
 **/
function ConceptNetworkState() {
  if (!(this instanceof ConceptNetworkState)) {
    return new ConceptNetworkState();
  }

  this.node = {}; // id -> id, label, occ
  this.link = {}; // linkId -> fromId, toId, coOcc
  this.nodeLastId = 0;
  this.labelIndex = {}; // label -> id
  this.fromIndex  = {}; // fromId -> linkId
  this.toIndex    = {}; // toId   -> linkId

}

// ## ConceptNetworkState's methods
ConceptNetworkState.prototype = {
};

module.exports.ConceptNetworkState = ConceptNetworkState;
