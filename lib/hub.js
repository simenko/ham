/**
 * Module dependencies.
 */

if (typeof uuid === 'undefined')
  var _uuid = require('node-uuid');
else _uuid = uuid;
var _ = require('../underscore')._;
var createMessage = require('./utils').createMessage;
var Actor = require('./actor');


var Hub = function () {
  this._id = _uuid();
  this._msgCount = 0;
  this.$ = {};
  // Service channel
  this.$._aux = {};
  this.$._aux[this._id] = {pub: true};
};

/**
 * Inherits Actor.
 */

Hub.prototype = new Actor;

/**
 * Creates and configures channel. If it already exists, only configures
 *
 * $param {string} [channel]
 * $param {object} [options] 
 * $returns {bool} success?
 */

Hub.prototype.setupChannel = function (channel, options)  {
  if ('string' === typeof channel)  {
    if (!this.$[channel])  {
        this.$[channel] = {};
    }
    this.$[channel] = _.extend(this.$[channel], options);
    return true;
  } else return false;
}

/**
 * Deletes channel.
 *
 * $param {string} [channel]
 * $returns {bool} success?
 */

Hub.prototype.deleteChannel = function (channel)  {
  if (this.$[channel])  {
    delete this.$[channel];
    return true;
  }
  return false;
}

/**
 * Allows actor to perform action on channel
 *
 * $param {string} [actorId]
 * $param {string} [action] pub or sub
 * $param {string} [channel]
 * @returns {bool} [success?]
 */

Hub.prototype.allow = function (actorId, action, channel)  {
  if (this.$[channel])  {
    if (!this.$[channel][actorId])
      this.$[channel][actorId] = {};
    this.$[channel][actorId][action] = true; 
    return true; 
  }
  return false;
}

/**
 * Allows many actor to perform action on many channels
 *
 * $param {array} [actorIds]
 * $param {string} [action] pub or sub
 * $param {array} [channels]
 * @returns {array} [what was actually allowed]
 */

Hub.prototype.bulkAllow = function (actorIds, action, channels)  {
  var result = [];
  for (var c in channels)
    for (var aId in actorIds)  {
      if (this.allow(actorIds[aId], action, channels[c]))
        result.push([actorIds[aId], channels[c]]);
    }
  return result;
};

/**
 * Denies actor to perform action on channel
 *
 * $param {string} [actorId]
 * $param {string} [action] pub or sub
 * $param {string} [channel]
 * $returns {bool} success?
 */

Hub.prototype.deny = function (actorId, action, channel)  {
  if (this.$[channel] && !this.$[channel]['_open_' + action])  {
    if (!this.$[channel][actorId])
      this.$[channel][actorId] = {};
    this.$[channel][actorId][action] = false;
    return true;
  } 
  return false;
}

/**
 * Denies many actors to perform action on many channels
 *
 * $param {array} [actorIds]
 * $param {string} [action] pub or sub
 * $param {array} [channels]
 * @returns {array} [what was actually denied]
 */

Hub.prototype.bulkDeny = function (actorIds, action, channels)  {
  var result = [];
  for (var c in channels)
    for (var aId in actorIds)  {
      if (this.deny(actorIds[aId], action, channels[c]))
        result.push([actorIds[aId], channels[c]]);
    }
  return result;
};

/**
 * Authorizes action. Allowed or denied actions are set in options parameter of
 * configureChannel(). Access rules are set only for individual actors. To create
 * roles or security groups use nested hubs. 
 *
 * $param {string} [channel]
 * $param {string} [action] Pub or Sub
 * $param {string} [actorId] 
 * $returns {bool} authorized?
 */

Hub.prototype.authorize = function (actorId, action, channel)  {
  if (this.$[channel])
    if (this.$[channel]['_open_' + action] ||
       (this.$[channel][actorId] &&
        this.$[channel][actorId][action]))
    return true;
  this.pub ('_aux', 'Unauthorized ' + action + ' on ' + channel + ' by ' + actorId);
  return false;
}

/**
 * Subscribes to channel.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $param {object} [handle]
 * $returns {bool} success?
 */

Hub.prototype.subscribe = function (channel, subscriberId, handle)  {
  if (!this.authorize(subscriberId, 'sub', channel))
    return false;
  this.$[channel][subscriberId]._handle = handle;
  return true;
}

/**
 * Subscribes to all channels, matching pattern.
 *
 * $param {string} [pattern]
 * $param {object} [subscriber]
 * $returns {array} matching channels
 */
 
Hub.prototype.Psubscribe = function (pattern, subscriberId, handle)  {
  var matches = [];

  var p = new RegExp(pattern, 'i');
  for (var t in this.$)  {
    if (p.test(t))  
      if (this.subscribe(t, subscriberId, handle))
        matches.push(t);
  }
  return matches; 
}

/**
 * Unsubscribes.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $returns {bool} success?
 */

Hub.prototype.unsubscribe = function (channel, subscriberId)  {
  if (this.$[channel] && this.$[channel][subscriberId])  {
    delete this.$[channel][subscriberId]._handle;
    return true;
  } else return false
}

/**
 * Unsubscribes channels matching pattern.
 *
 * $param {string} [pattern]
 * $param {string} [subscriberId]
 * $returns {array} matching channels
 */
  
Hub.prototype.Punsubscribe = function (pattern, subscriberId)  {
  var matches = [];
  
  var p = new RegExp(channel, 'i');
  for (var t in this.$)  {
    if (p.test(t))  
      if (this.unsubscribe(t, subscriberId))
        matches.push(t);
  }
  return matches;
}

/**
 * Creates and publishes message
 *
 * $param {string} [channel] 
 * $param {any} [body] message body
 * $param {object} [options] see createMessage
 * $returns {true|false} success|failure
 */

Hub.prototype.pub = function (channel, body, options) {
  msg = createMessage(channel, body, options);
  msg._id = this._id + '#' + this._msgCount++;
  return this.publish (msg, this._id, this);
}

/**
 * Publishes message
 *
 * $param {object} [message] 
 * $param {string} [publisherId]
 * $param {object} [handle] 
 * $returns {true|false} success|failure
 */

Hub.prototype.publish = function (msg, publisherId, handle) {
  if (!this.authorize(publisherId, 'pub', msg.channel))
    return false;
  // if message requires answer
  if (msg.answerMe)  {
    // create temp channel for it
    var reChannel = '_re:' + msg._id;
    this.setupChannel(reChannel, {publisherId: {sub: true}});
    this.subscribe (reChannel, publisherId, handle);
    this.$[reChannel]._re = true;
    // and delete this channel after msg.ttl milliseconds, or 1 second if ttl is empty
    self = this;
    setTimeout (function () { self.deleteChannel(reChannel); }, msg.ttl ? msg.ttl : 1000);
  }
  // send message to all subscribers
  for (var s in this.$[msg.channel])  {
    if (this.$[msg.channel][s]._handle)
      this.$[msg.channel][s]._handle.recieve(msg);
  }
  // if this message is an answer to one of previous messages, delete channel 
  // after sending
  if (this.$[msg.channel]._re)  
    this.deleteChannel(msg.channel);
  return true;
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.publish;


/**
 * Dumps current state
 */

Hub.prototype.dump = function (channel) {
  var dump = '';
  if (channel in this.$)  {
  dump += '### ' + channel + ' ###\n';
    for (var c in this.$[channel])  {
      dump += '  ' + c + ': ' + this.$[channel][c] + ' \n';
      for (s in this.$[channel][c])
        dump += '    ' + s + ': ' + this.$[channel][c][s] + '\n';
    }
  } else {
    for (var chan in this.$)  {
      dump += '### ' + chan + ' ###\n';
      for (var c in this.$[chan])  {
        dump += '  ' + c + ': ' + this.$[chan][c] + ' \n';
        for (s in this.$[chan][c])
          dump += '    ' + s + ': ' + this.$[chan][c][s] + '\n';
      }
    }
  }          
  return dump;
}

exports = module.exports = Hub;
