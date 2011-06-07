'use strict'
/**
 * Module dependencies.
 */

var Actor = require('./actor');
var id = require('./utils').id;

var Interface = function ()  {
  this._id = id();  
  this._msgCount = 0;
  this._in = '_in_' + this._id;
  this._out = '_out_' + this._id;
  this._listeners = {}; 
}

/**
 * Inherits Actor.
 */

Interface.prototype = new Actor;

exports = module.exports = Interface;
