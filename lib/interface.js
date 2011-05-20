/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Interface = function (hub)  {
  this._id = uuid();
  this._msgCount = 0;
  this.hub = hub;
}

/**
 * Inherits Actor.
 */

Interface.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Interface.prototype.process = function (msg)  {}

/**
 * Public API.
 */

exports = module.exports = Interface;
