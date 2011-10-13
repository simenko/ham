'use strict'
/**
 * Module dependencies.
 */

if (typeof window === 'undefined') var util = require('util');  /////////////////debug only

var _ = require('./utils');  // Customized underscore lib
var Actor = require('./actor');


var OpenHub = function (id) {
  this._id = id || 'hub';  /////////////////debug only
  this._msgCount = 0;
  this._in = '_in_' + this._id;
  this._out = '_out_' + this._id;  
  this.$ = {};
};

/**
 * Inherits Actor.
 */

OpenHub.prototype = new Actor;

/**
 * Connects actor to the hub
 *
 * $param {object} [actor]
 */
 
OpenHub.prototype.connect = function (a)  {
  a.hub = this;
  a.connect();
}

/**
 * Deletes channel.
 *
 * $param {string} [channel]
 * $returns {bool} success?
 */

OpenHub.prototype.deleteChannel = function (channel)  {
  if (this.$[channel])  {
    delete this.$[channel];
    return true;
  }
  return false;
}

/**
 * Subscribes to channel. If there is now such channel, creates it.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $param {object} [handle]
 */

OpenHub.prototype.subscribe = function (channel, subscriber)  {

  var changes = {};
  changes[channel] = {};
  changes[channel][subscriber.id()] = {_handle: subscriber};
  _.deepExtend(this.$, changes, 2);
};

/**
 * Unsubscribes.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $returns {bool} success?
 */

OpenHub.prototype.unsubscribe = function (channel, subscriber)  {
  if (this.$[channel] && 
      this.$[channel][subscriber.id()] && 
      this.$[channel][subscriber.id()]._handle)  {
    delete this.$[channel][subscriber.id()]._handle;
    return true;
  } else return false;
}

/**
 * Subscribes to channels matching pattern or present in array.
 *
 * $param {RegExp|Array} [channels]
 * $param {Array} [subscribers]   
 */
 
OpenHub.prototype.multiSub = function (channels, subscribers, unsub)  {
  var s,
      c,
      action = this.subscribe,
      result = [];
      
  if (unsub) action = this.unsubscribe;

  if (channels instanceof RegExp)  {
    for (c in this.$)  {
      if (channels.test(c))  { 
        result.push(c);
        for (s in subscribers)  {
          action.call(this, c, subscribers[s]);
        }
      }
    }
  } else if (channels instanceof Array)  {
    for (c in channels)  {
      result.push(channels[c]);
      for (s in subscribers) {
        action.call(this, channels[c], subscribers[s]);
      }
    }
  }
//  console.log(result);
  return result;
}

/**
 * Unsubscribes channels matching pattern or present in array.
 *
 * $param {RegExp|Array} [channels]
 * $param {Array} [subscriberIds]
 */
  
OpenHub.prototype.multiUnsub = function (channels, subscribers)  {
  this.multiSub(channels, subscribers, true);
}

/**
 * Creates and publishes message
 *
 * $param {string} [channel] 
 * $param {any} [body] message body
 * $param {object} [options] see createMessage
 * $returns {true|false} success|failure
 */

OpenHub.prototype.pub = function (channel, body, options) {
  var msg = _.createMessage(channel, body, options);
  msg._id = this._id + '#' + this._msgCount++;
  return this.publish (msg, this);
}

/**
 * Publishes message
 *
 * $param {object} [message] 
 * $param {string} [publisherId]
 * $param {object} [handle] 
 */

OpenHub.prototype.publish = function (msg, publisher) {
  var s,
      self,
      reChannel;
  
  // if message requires answer
  if (msg.answerMe)  {
    // create temp channel for it, 
    reChannel = '_re:' + msg._id;
    // subscribe publisher on it
    this.subscribe (reChannel, publisher);
    // and allow all subscribers of initial message to publish on it
    for (s in this.$[msg.channel])  {
      this.$[reChannel][s] = {};
    }
    this.$[reChannel]._re = true;
    // delete this channel after msg.ttl milliseconds
    self = this;
    setTimeout (function () { self.deleteChannel(reChannel); }, msg.ttl);
  }
  // send message to all subscribers
  for (s in this.$[msg.channel])  {
    if (this.$[msg.channel][s]._handle)  {
      this.$[msg.channel][s]._handle.receive(msg);
    }  
  }
}

// alias for interhub communication
OpenHub.prototype.recieve = OpenHub.prototype.publish;

/////////////////debug only

OpenHub.prototype.dump = function (channel) {
  return util.inspect(this.$);
}

exports = module.exports = OpenHub;
