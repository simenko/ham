'use strict'
/**
 * Module dependencies.
 */

if (typeof window === 'undefined') var util = require('util');  /////////////////debug only

var _ = require('./utils');  // Customized underscore lib
var Actor = require('./actor');


var Hub = function (id) {
  this._id = id || 'hub';  /////////////////debug only
  this._msgCount = 0;
  this._in = '_in_' + this._id;
  this._out = '_out_' + this._id;  
  this.$ = {};
  this.rules('allowSub', this._in, this);
  this.rules('allowPub', this._out, this);
};

/**
 * Inherits Actor.
 */

Hub.prototype = new Actor;

/**
 * Connects actor to the hub
 *
 * $param {object} [actor]
 */
 
Hub.prototype.connect = function (a)  {
  a.hub = this;
  this.rules('allowSub', a._in, a);
  this.rules('allowPub', a._out, a);
  this.rules('allowSub', this._out, a);
  this.rules('allowSub', a._out, this);
  // actor's specific subsciptions, etc.
  a.connect();
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
 * Sets access rules. If there is no such channel, creates it
 *
 * $param {string} [action] See allowed options in switch statement
 * $param {string|RegExp|Array} [channels] 
 * $param {string|object|Array of strings|objects} [actors] 
 */
 
Hub.prototype.rules = function (action, channels, actors)  {
  var a,
      c,
      temp = [],
      changes = {};
      
  if (actors && !(actors instanceof Array))  {
    actors = [actors];
  }
  for (a in actors)  {
    if (actors[a].id && actors[a].id())  {
      actors[a] = actors[a].id();   
    }
  }
  if (channels instanceof RegExp)  {
    for (c in this.$)  { 
      if (channels.test(c))  {
        temp.push(c);
      }
    }
    channels = temp;
  } else if (!(channels instanceof Array))  {
    channels = [channels];
    }
  for (c in channels)  {
    changes[channels[c]] = {};
    switch (action)  {
    case 'openSub':
      changes[channels[c]]._opensub = true;
      break;
    case 'openPub':
      changes[channels[c]]._openpub = true;
      break;
    case 'closeSub':
      changes[channels[c]]._opensub = false;
      break;
    case 'closePub':
      changes[channels[c]]._openpub = false;
      break;
    case 'allowSub':
      for (a in actors)  {
        changes[channels[c]][actors[a]] = {};      
        changes[channels[c]][actors[a]]._allowsub = true;
      }
      break;
    case 'allowPub':        
      for (a in actors)  {
        changes[channels[c]][actors[a]] = {};      
        changes[channels[c]][actors[a]]._allowpub = true;
      }
      break;
    case 'denySub':
      for (a in actors)  {
        changes[channels[c]][actors[a]] = {};      
        changes[channels[c]][actors[a]]._allowsub = false;
      }
      break;
    case 'denyPub':        
      for (a in actors)  {
        changes[channels[c]][actors[a]] = {};      
        changes[channels[c]][actors[a]]._allowpub = false;
      }
      break;
    }//case
  }//for
  _.deepExtend(this.$, changes, 4);
}

/**
 * Authorizes action. Access rules are set only for individual actors or the whole channel.
 * To create roles or security groups use arrays or nested hubs. 
 *
 * $param {string} [channel]
 * $param {string} [action] pub or sub
 * $param {string} [actorId] 
 * $returns {bool} authorized?
 */

Hub.prototype.authorize = function (actorId, action, channel)  {
  if (this.$[channel] &&
     (this.$[channel]['_open' + action] ||
       (this.$[channel][actorId] &&
        this.$[channel][actorId]['_allow' + action]
       )
     ))  {  return true; }
  this.pub (this._out, 'Unauthorized ' + action + ' on ' + channel + ' by ' + actorId);
  return false;
}

/**
 * Subscribes to channel. If there is now such channel, creates it.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $param {object} [handle]
 * $returns {bool} Is the subscriber allowed to subscribe?
 */

Hub.prototype.subscribe = function (channel, subscriber)  {

  var changes = {};
  changes[channel] = {};
  changes[channel][subscriber.id()] = {_handle: subscriber};
  _.deepExtend(this.$, changes, 2);
  
  if (this.authorize(subscriber.id(), 'sub', channel))  return true;
  else return false;
};

/**
 * Unsubscribes.
 *
 * $param {string} [channel]
 * $param {string} [subscriberId]
 * $returns {bool} success?
 */

Hub.prototype.unsubscribe = function (channel, subscriber)  {
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
 
Hub.prototype.multiSub = function (channels, subscribers, unsub)  {
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
  
Hub.prototype.multiUnsub = function (channels, subscribers)  {
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

Hub.prototype.pub = function (channel, body, options) {
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
 * $returns {true|false} success|failure
 */

Hub.prototype.publish = function (msg, publisher) {
  var s,
      self,
      reChannel;
  
  //console.log(util.inspect(msg))
  if (!this.authorize(publisher.id(), 'pub', msg.channel))
    return false;
  // if message requires answer
  if (msg.answerMe)  {
    // create temp channel for it, 
    reChannel = '_re:' + msg._id;
    // subscribe publisher on it
    this.rules('allowSub', reChannel, publisher);
    this.subscribe (reChannel, publisher);
    // and allow all subscribers of initial message to publish on it
    for (s in this.$[msg.channel])  {
      if (this.authorize(s, 'sub', msg.channel))  {
        this.$[reChannel][s] = {};
        this.$[reChannel][s]._allowpub = true;
      }
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
  return true;
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.publish;

/////////////////debug only

Hub.prototype.dump = function (channel) {
  return util.inspect(this.$);
}

exports = module.exports = Hub;
