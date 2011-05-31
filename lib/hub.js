/**
 * Module dependencies.
 */

var uuid = require('node-uuid');
var _ = require('../underscore')._;
var createMessage = require('./utils').createMessage;


var Hub = function (name) {
  this.name = name.toString();
  this._id = this.name + uuid().slice(0,4);
  this._channels = {_aux: {subscribers: []}};
  this._msgCount = 0;
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

Hub.prototype.createChannel = function (channel, options)  {
  if ('string' === typeof channel)  {
    if (!(channel in this._channels))  {
        this._channels[channel] = { subscribers: [] };
    }
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
 * Allows actor to perform action on channel
 *
 * @param {string} [actorId]
 * @param {string} [action] pub or sub
 * @param {string} [channel]
 */

Hub.prototype.allow = function (actorId, action, channel)  {
  if (channel in this._channels)  {
    if (_.isArray(this._channels[channel]['allow_' + action]))
      this._channels[channel]['allow_' + action].push(actorId);
    else 
      this._channels[channel]['allow_' + action] = [actorId];
  }
}

/**
 * Denies actor to perform action on channel
 *
 * @param {string} [actorId]
 * @param {string} [action] pub or sub
 * @param {string} [channel]
 */

Hub.prototype.deny = function (actorId, action, channel)  {
  if (channel in this._channels)  {
    if (_.isArray(this._channels[channel]['deny_' + action]))
      this._channels[channel]['deny_' + action].push(actorId);
    else 
      this._channels[channel]['deny_' + action] = [actorId];
  }
}

/**
 * Dumps current state
 */

Hub.prototype.dump = function () {
  for (var c in this._channels)  {
    console.log ('### ' + c + ' ###');
    for (var cc in this._channels[c])  {
      if (cc === 'subscribers') {
        console.log('  Subscribers:')      
        for (s in this._channels[c][cc])
          console.log('    ' + this._channels[c][cc][s].id())
      } else console.log('  ' + cc, this._channels[c][cc]);
    }  
  }
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
  if (this._channels[channel]['allow_' + action])  {
    if (_.indexOf(this._channels[channel]['allow_' + action], actorId) !== -1) return true;
    else {
      this.pub ('_aux', 'Unauthorized ' + action + ' on ' + channel + ' by ' + actorId);
      return false;
    }
  }
  if (this._channels[channel]['deny_' + action])  {
    if (_.indexOf(this._channels[channel]['deny_' + action], actorId) !== -1)  {
      this.pub ('_aux', 'Unauthorized ' + action + ' on ' + channel + ' by ' + actorId);
      return false;
    }
    else return true;
  }
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
  if (channel in this._channels)   {
    if (!this._channels[channel].open && !this.authorize(channel, 'sub', subscriber.id())) 
      return false;
    if (this._channels[channel].subscribers.indexOf(subscriber) === -1)  {
      this._channels[channel].subscribers.push(subscriber);
    }
    return true; 
  } else {
    this.pub ('_aux', subscriber.id() + ' attempted to subscribe to unexistant channel ' + channel );
    return false;
  }
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
  for (var t in this._channels)  {
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
  
Hub.prototype.Punsubscribe = function (pattern, subscriber)  {
  var matches = [];
  
  var p = new RegExp(channel, 'i');
  for (var t in this._channels)  {
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
  msg._id = this._id + '#' + this._msgCount++;
  return this.publish (msg, this);
}

/**
 * Publishes message
 *
 * @param {object} [message] 
 * @param {object} [publisher] 
 * @returns {true|false} success|failure
 */

// TODO: publisers list for not to check authorization each time

Hub.prototype.publish = function (msg, publisher) {
  if (msg.channel in this._channels) {
    if (!this._channels[msg.channel].open && !this.authorize(msg.channel, 'pub', publisher.id())) 
      return false;
    // if message requires answer
    if (msg.answerMe)  {
      var reChannel = '_re:' + msg._id;
      // create temp channel for it
      this.createChannel(reChannel);
      this.configureChannel(reChannel, { allowSub: publisher.id() })
      this.subscribe (reChannel, publisher);
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

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.publish;

exports = module.exports = Hub;
