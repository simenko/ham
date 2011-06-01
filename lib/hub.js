/**
 * Module dependencies.
 */

var uuid = require('node-uuid');
var _ = require('../underscore')._;
var createMessage = require('./utils').createMessage;


var Hub = function (name) {
  this._name = name.toString();
  this._id = this._name + uuid().slice(0,4);
  this._msgCount = 0;
  this._ = {};
  // Service channel
  this._._aux = {_openpub: true};
};

/**
 * Getter for _id
 *
 * @returns {string} _id
 */

Hub.prototype.id = function ()  {
  return this._id;
}

/**
 * Creates and configures channel. If it already exists, only configures
 *
 * @param {string} [channel]
 * @param {object} [options] 
 * @returns {bool} success?
 */

Hub.prototype.setupChannel = function (channel, options)  {
  if ('string' === typeof channel)  {
    if (!this._[channel])  {
        this._[channel] = {};
    }
    this._[channel] = _.extend(this._[channel], options);
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
    if (this._[channel])  {
        delete this._[channel];
    }
    return true;
  } else return false;
}

/**
 * Allows actor to perform action on channel
 *
 * @param {string} [actorId]
 * @param {string} [action] pub or sub
 * @param {string} [channel]
 */

Hub.prototype.allow = function (actorId, action, channel)  {
  if (this._[channel])  {
    if (!this._[channel][actorId])
      this._[channel][actorId] = {};
    this._[channel][actorId][action] = true;  
  }
}

/**
 * Denies actor to perform action on channel
 *
 * @param {string} [actorId]
 * @param {string} [action] pub or sub
 * @param {string} [channel]
 * @returns {bool} success?
 */

Hub.prototype.deny = function (actorId, action, channel)  {
  if (this._[channel] && !this._[channel]['_open' + action])  {
    if (!this._[channel][actorId])
      this._[channel][actorId] = {};
    this._[channel][actorId][action] = false;
    return true;
  } 
  return false;
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

Hub.prototype.authorize = function (actorId, action, channel)  {
  if (this._[channel])
    if (this._[channel]['_open' + action] ||
       (this._[channel][actorId] &&
        this._[channel][actorId][action]))
    return true;
  this.pub ('_aux', 'Unauthorized ' + action + ' on ' + channel + ' by ' + actorId);
  return false;
}

/**
 * Subscribes to channel.
 *
 * @param {string} [channel]
 * @param {object} [subscriber]
 * @returns {bool} success?
 */

Hub.prototype.subscribe = function (channel, subscriber)  {
  if (!this.authorize(subscriber.id(), 'sub', channel))
    return false;
  this._[channel][subscriber.id()].__handle__ = subscriber;
  return true;
}

/**
 * Subscribes to all channels, matching pattern.
 *
 * @param {string} [pattern]
 * @param {object} [subscriber]
 * @returns {array} matching channels
 */
 
Hub.prototype.Psubscribe = function (pattern, subscriber)  {
  var matches = [];

  var p = new RegExp(pattern, 'i');
  for (var t in this._)  {
    if (p.test(t))  
      if (this.subscribe(t, subscriber))
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

Hub.prototype.unsubscribe = function (channel, subscriber)  {
  if (channel in this)  {
    delete this._[channel][subscriber.id()];
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
  
Hub.prototype.Punsubscribe = function (pattern, subscriber)  {
  var matches = [];
  
  var p = new RegExp(channel, 'i');
  for (var t in this)  {
    if (p.test(t))  
      if (this.unsubscribe(t, subscriber))
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

Hub.prototype.pub = function (channel, body, options) {
  msg = createMessage(channel, body, options);
  msg._id = this.id() + '#' + this._msgCount++;
  return this.publish (msg, this);
}

/**
 * Publishes message
 *
 * @param {object} [message] 
 * @param {object} [publisher] 
 * @returns {true|false} success|failure
 */

Hub.prototype.publish = function (msg, publisher) {
  var publisherId = publisher.id();
  if (!this.authorize(publisherId, 'pub', msg.channel))
    return false;
  // if message requires answer
  if (msg.answerMe)  {
    // create temp channel for it
    var reChannel = '_re:' + msg._id;
    this.setupChannel(reChannel, {publisherId: {sub: true}});
    this.subscribe (reChannel, publisher);
    this._[reChannel].__re__ = true;
    // and delete this channel after msg.ttl milliseconds, or 1 second if ttl is empty
    that = this;
    setTimeout (function () { that.deleteChannel(reChannel); }, msg.ttl ? msg.ttl : 1000);
  }
  // send message to all subscribers
  for (var s in this._[msg.channel])  {
    if (this._[msg.channel][s].__handle__)
      this._[msg.channel][s].__handle__.recieve(msg);
  }
  // if this message is an answer to one of previous messages, delete channel 
  // after sending
  if (this._[msg.channel].__re__)  
    this.deleteChannel(msg.channel);
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.publish;


/**
 * Dumps current state
 */

Hub.prototype.dump = function (channel) {
  var dump = '';
  if (channel in this._)  {
  dump += '### ' + channel + ' ###\n';
    for (var c in this._[channel])  {
      dump += '  ' + c + ': ' + this._[channel][c] + ' \n';
      for (s in this._[channel][c])
        dump += '    ' + s + ': ' + this._[channel][c][s] + '\n';
    }
  } else {
    for (var chan in this._)  {
      dump += '### ' + chan + ' ###\n';
      for (var c in this._[chan])  {
        dump += '  ' + c + ': ' + this._[chan][c] + ' \n';
        for (s in this._[chan][c])
          dump += '    ' + s + ': ' + this._[chan][c][s] + '\n';
      }
    }
  }          
  return dump;
}

exports = module.exports = Hub;
