/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Storage = function (hub)  {
  this._id = uuid();
  this._msgCount = 0;
  this.hub = hub;
  this.db = {};
  this.stored = 0;
}

/**
 * Inherits Actor.
 */

Storage.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Storage.prototype.process = function (msg)  {}

/**
 * Public API.
 */

exports = module.exports = Storage;
