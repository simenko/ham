/**
 * Module dependencies.
 */

var _ = require('../underscore')._;
var createMessage = require('./utils').createMessage;


var Actor = function ()  {
}

/**
 * Recieves message and dispatches it to corresponding listener.
 * _listeners array should be defined in the inherited object
 *
 * @param {object} [msg] the message
 */

Actor.prototype.recieve = function (msg) {
  this._listeners[msg.channel].call(this, msg);
}

/**
 * Subscribes to the channel and bind listener to its messages
 *
 * @param {string} [channel] the channel
 * @param {function} [listener] the listener
 * @returns {true|false} success|failure
 */ 

Actor.prototype.sub = function (channel, listener)  {
  if (this.hub.sub (channel, this))  {
    this._listeners[channel] = listener;
    return true;
  }
  return false;
}

/**
 * Subscribes to all channels matching pattern
 *
 * @param {string} [pattern] contains regular expression
 * @param {function} [listener] the listener
 * @returns {array} matching channels
 */  

Actor.prototype.Psub = function (pattern, listener)  {
  var channels = this.hub.Psub (pattern, this)
  for (var c in channels)  {
    this._listeners[channels[c]] = listener;
  }
  return channels;
}

/**
 * Unsubscribes channel and unbinds listener
 *
 * @param {string} [channel] the channel
 * @returns {true|false} success|failure
 */ 

Actor.prototype.unsub = function (channel)  {
  if (this.hub.unsub (channel, this))  {
    this._listeners[channel] = undefined;
    return true;
  }
  return false;
}

/**
 * Unsubscribes matching channels and unbinds listeners
 *
 * @param {string} [pattern] contains regular expression
 * @returns {array} matching channels
 */ 

Actor.prototype.Punsub = function (pattern)  {
  var channels = this.hub.Punsub (pattern, this)
  for (var c in channels)  {
    this._listeners[channels[c]] = undefined;
  }
  return channels;
}

/**
 * Creates and publishes message
 *
 * @param {string} [channel] 
 * @param {any} [body] message body
 * @param {object} [options] see createMessage
 * @returns {true|false} success|failure
 */ 
 
Actor.prototype.pub = function (channel, body, options) {
  msg = createMessage(channel, body, options);
  msg._id = this._id + '#' + this._msgCount++;
  return this.hub.pub (msg, this);
}


exports = module.exports = Actor;
