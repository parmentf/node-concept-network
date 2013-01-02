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

  this.activationValue = [];  // nodeId -> activation value
  if (!(cn instanceof ConceptNetwork)) {
    throw new Error("Parameter is required");
  }
}

// ## ConceptNetworkState's methods
ConceptNetworkState.prototype = {
};

module.exports.ConceptNetworkState = ConceptNetworkState;
