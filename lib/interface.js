/**
 * Module dependencies.
 */

var Actor = require('./actor');
if (typeof uuid === 'undefined')
  var _uuid = require('node-uuid');
else _uuid = uuid;


var Interface = function ()  {
  this._id = _uuid();
  this._msgCount = 0;
  this.hub = null;
  this._listeners = {};
}

/**
 * Inherits Actor.
 */

Interface.prototype = new Actor;

exports = module.exports = Interface;
