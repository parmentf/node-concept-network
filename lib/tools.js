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
