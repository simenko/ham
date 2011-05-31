/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');


var Interface = function (name)  {
  this.name = name.toString();
  this._id = this.name + uuid().slice(0,4);
  this._msgCount = 0;
  this.hub = null;
  this._listeners = {};
}

/**
 * Inherits Actor.
 */

Interface.prototype.__proto__ = Actor.prototype;

exports = module.exports = Interface;
