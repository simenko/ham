/**
 * Module dependencies.
 */

var uuid = require('node-uuid');
var _ = require('../underscore')._;
var createMessage = require('./utils').createMessage;


var Hub = function (name) {
  this.name = name.toString();
  this._id = this.name + uuid().slice(0,4);
  this._channels = {};
  this._msgCount = 0;
};

/**
 * Creates channel. If it already exists, does nothing
 *
 * @param {string} [channel]
 * @returns {bool} success?
 */

Hub.prototype.createChannel = function (channel)  {
  if ('string' === typeof channel)  {
    if (!(channel in this._channels))  {
        this._channels[channel] = { subscribers: [] };
    }
    return true;
  } else return false;
}

/**
 * Creates several channels at once.
 *
 * @param {array} [channels]
 */
 
Hub.prototype.createChannels = function (channels)  {
  if (_.isArray(channels))  {
    for (t in channels)  {
      this.createChannel (channels[t]);
    }
  }
}

/**
 * Sets channels options. 
 *
 * @param {string} [channel]
 * @param {object} [options] 
 * @returns {bool} channel exists?
 */

Hub.prototype.configureChannel = function (channel, options)  {
  if (channel in this._channels)  {
    this._channels[channel] = _.extend(this._channels[channel], options);
    return true;        
  } else return false;
}


/**
 * Deletes channel.
 *
 * @param {string} [channel]
 * @returns {bool} success?
 */

Hub.prototype.deleteChannel = function (channel)  {
  if ('string' === typeof channel)  {
    if (channel in this._channels)  {
        this._channels[channel] = undefined;
    }
    return true;
  } else return false;
}

/**
 * Authorizes action. Allowed or denied actions are set in options parameter of
 * configureChannel(). Access rules are set only for individual actors. To create
 * roles or security groups use nested hubs. 
 *
 * @param {string} [channel]
 * @param {string} [action] Pub or Sub
 * @param {string} [actorId] 
 * @returns {bool} authorized?
 */

Hub.prototype.authorize = function (channel, action, actorId)  {
  if (this._channels[channel]['allow' + action])  {
    if (this._channels[channel]['allow' + action] === actorId) return true;
    if (_.indexOf(this._channels[channel]['allow' + action], actorId) !== -1) return true;
    return false;
  }
  if (this._channels[channel]['deny' + action])  {
    if (this._channels[channel]['deny' + action] === actorId) return false;
    if (_.indexOf(this._channels[channel]['deny' + action], actorId) !== -1) return false;
    return true;
  }
  return true;
}

/**
 * Subscribes to channel.
 *
 * @param {string} [channel]
 * @param {object} [subscriber]
 * @returns {bool} success?
 */

Hub.prototype.sub = function (channel, subscriber)  {
  if (channel in this._channels)   {
    if (!this.authorize(channel, 'Sub', subscriber._id)) return false;
    if (this._channels[channel].subscribers.indexOf(subscriber) === -1)  {
      this._channels[channel].subscribers.push(subscriber);
    }
    return true; 
  } else return false;
}

/**
 * Subscribes to all channels, matching pattern.
 *
 * @param {string} [pattern]
 * @param {object} [subscriber]
 * @returns {array} matching channels
 */
 
Hub.prototype.Psub = function (pattern, subscriber)  {
  var matches = [];

  var p = new RegExp(pattern, 'i');
  for (var t in this._channels)  {
    if (p.test(t))  
      if (this.sub(t, subscriber))
        matches.push(t);
  }
  return matches; 
}

/**
 * Unsubscribes. Does not delete empty channel.
 *
 * @param {string} [channel]
 * @param {object} [subscriber]
 * @returns {bool} success?
 */

Hub.prototype.unsub = function (channel, subscriber)  {
  if (channel in this._channels)  {
    var i = this._channels[channel].subscribers.indexOf(subscriber);
    if (i !== -1)  {
      this._channels[channel].subscribers.splice(i, 1);
    }
    return true;
  } else return false
}

/**
 * Unsubscribes channels matching pattern.
 *
 * @param {string} [pattern]
 * @param {object} [subscriber]
 * @returns {array} matching channels
 */
  
Hub.prototype.Punsub = function (pattern, subscriber)  {
  var matches = [];
  
  var p = new RegExp(channel, 'i');
  for (var t in this._channels)  {
    if (p.test(t))  
      if (this.unsub(t, subscriber))
        matches.push(t);
  }
  return matches;
}

/**
 * Creates and publishes message
 *
 * @param {string} [channel] 
 * @param {any} [body] message body
 * @param {object} [options] see createMessage
 * @returns {true|false} success|failure
 */

Hub.prototype.pubOwn = function (channel, body, options) {
  msg = createMessage(channel, body, options);
  msg._id = this._id + '#' + this._msgCount++;
  return this.pub (msg, this);
}

/**
 * Publishes message
 *
 * @param {object} [message] 
 * @param {object} [publisher] 
 * @returns {true|false} success|failure
 */

// TODO: publisers list for not to check authorization each time

Hub.prototype.pub = function (msg, publisher) {
  if (msg.channel in this._channels) {
    if (!this.authorize(msg.channel, 'Pub', publisher._id)) return false;
    // if message requires answer
    if (msg.answerMe)  {
      var reChannel = '_re:' + msg._id;
      // create temp channel for it
      this.createChannel(reChannel);
      this.configureChannel(reChannel, { allowSub: publisher._id })
      this.sub (reChannel, publisher);
      this._channels[reChannel].re = true;
      // and delete this channel after msg.ttl milliseconds, or 1 second if ttl is empty
      that = this;
      setTimeout (function () { that.deleteChannel(reChannel); }, msg.ttl ? msg.ttl : 1000);
    }
    // if this message is an answer to one of previous messages, delete channel 
    // after sending
    if (this._channels[msg.channel].re)  {
      this._channels[msg.channel].subscribers[0].recieve(msg);
      this.deleteChannel(msg.channel);
    }
    // send message to all subscribers
    for (var s in this._channels[msg.channel].subscribers)  {
      this._channels[msg.channel].subscribers[s].recieve(msg);
    }
    return true;
  } else return false;
}

Hub.prototype.log = function (anything)  {
  this.pubBySelf ('_log', arguments);
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.pub;


exports = module.exports = Hub;
