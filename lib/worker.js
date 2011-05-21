/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Worker = function (hub)  {
  this._id = uuid();
  this._msgCount = 0;
  this.hub = hub;
}

/**
 * Inherits Actor.
 */

Worker.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Worker.prototype.process = function (msg)  {}
 
/**
 * Public API.
 */

exports = module.exports = Worker;
