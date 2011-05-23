/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Processor = function ()  {
  this._id = uuid();
  this._msgCount = 0;
  this.hub = null;
}

/**
 * Inherits Actor.
 */

Processor.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Processor.prototype.recieve = function (msg)  {}
 
/**
 * Public API.
 */

exports = module.exports = Processor;
