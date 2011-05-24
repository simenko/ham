/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Interface = function ()  {
  this._id = uuid();
  this._msgCount = 0;
  this.hub = null;
  this._listeners = {};
}

/**
 * Inherits Actor.
 */

Interface.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */


/**
 * Public API.
 */

exports = module.exports = Interface;
