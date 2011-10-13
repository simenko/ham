'use strict'
/**
 * Module dependencies.
 */

//var profiler = require('v8-profiler');
 
var _ = require('./utils');


var Actor = function () {}

/**
 * Getter for _id
 *
 * @returns {string} _id
 */

Actor.prototype.id = function ()  {
  return this._id;
}

/**
 * Override it to do initial subscribes
 */

Actor.prototype.connect = function()  {}

/**
 * Default listener. logs unknown message
 */

Actor.prototype.defaultListener = function (msg)  {
  console.log(this._id + ': Ooops! ' + msg._id + ', ' + msg.channel + ', ' + msg.body);
}

/**
 * Default listener for personal messages
 */


Actor.prototype.on_in = function (msg)  {
  console.log(this._id + ': _in message ' + msg._id + ', ' + msg.channel);
}

/**
 * Recieves message and dispatches 
 * it to corresponding listener.
 * _listeners array should be defined in the inherited object
 *
 * @param {object} [msg] the message
 */


Actor.prototype.receive = function (msg) {
  (this._listeners[msg.channel] || this.defaultListener).call(this, msg);
}

/**
 * Subscribes to the channel and binds listener to its messages
 *
 * @param {string} [channel] the channel
 * @param {function} [listener] the listener
 * @returns {true|false} success|failure
 */ 

Actor.prototype.sub = function (channel, listener)  {
  this._listeners[channel] = listener;
  if (this.hub.subscribe (channel, this))  {
    return true;
  }
  return false;
}

/**
 * Subscribes to all channels matching pattern
 *
 * @param {RegExp} [pattern] contains regular expression
 * @param {function} [listener] the listener
 * @returns {array} matching channels
 */  

Actor.prototype.multiSub = function (pattern, listener)  {
  var channels = this.hub.multiSub (pattern, [this])
  for (var c in channels)  {
    this._listeners[channels[c]] = listener;
  }
  return channels;
}

/**
 * Unsubscribes channel and unbinds listener
 *
 * @param {string} [channel] the channel
 */ 

Actor.prototype.unsub = function (channel)  {
  this.hub.unsubscribe (channel, this);
  this._listeners[channel] = undefined;
}

/**
 * Unsubscribes matching channels and unbinds listeners
 *
 * @param {string} [pattern] contains regular expression
 * @returns {array} matching channels
 */ 

Actor.prototype.multiUnsub = function (pattern)  {
  var channels = this.hub.multiUnsub (pattern, [this])
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
  var msg = _.createMessage(channel, body, options);
  msg._id = this._id + '#' + this._msgCount++;
  return this.hub.publish (msg, this);
}


exports = module.exports = Actor;
