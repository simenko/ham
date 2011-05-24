var uuid = require('node-uuid');
var _ = require('../underscore')._;

/**
 * Constructor.
 */

var Hub = function () {
  this._id = uuid();
  this._channels = {};
  this._msgCount = 0;
};

/**
 * Methods.
 */

Hub.prototype.createChannel = function (channel)  {
  if ('string' === typeof channel)  {
    if (!(channel in this._channels))  {
        this._channels[channel] = { subscribers: [] };
    }
    console.log('Create: ' + channel);
    return true;
  } else return false;
}

Hub.prototype.createChannels = function (channels)  {
  if (_.isArray(channels))  {
    for (t in channels)  {
      this.createChannel (channels[t]);
    }
  }
}

Hub.prototype.configureChannel = function (channel, options)  {
  if (channel in this._channels)  {
    this._channels[channel] = _.extend(this._channels[channel], options);
    return true;        
  } else return false;
}

Hub.prototype.deleteChannel = function (channel)  {
  if ('string' === typeof channel)  {
    if (channel in this._channels)  {
        this._channels[channel] = undefined;
    }
    console.log ('Delete: ' + channel);
    return true;
  } else return false;
}

Hub.prototype.authorize = function (channel, action, actor)  {
  if (this._channels[channel]['allow' + action])  {
    if (this._channels[channel]['allow' + action] === actor) return true;
    if (_.indexOf(this._channels[channel]['allow' + action], actor) !== -1) return true;
    return false;
  }
  if (this._channels[channel]['deny' + action])  {
    if (this._channels[channel]['deny' + action] === actor) return false;
    if (_.indexOf(this._channels[channel]['deny' + action], actor) !== -1) return false;
    return true;
  }
  return true;
}

// subscribe. 
Hub.prototype.sub = function (channel, subscriber)  {
  if (channel in this._channels)   {
    if (!this.authorize(channel, 'Sub', subscriber)) return false;
    if (this._channels[channel].subscribers.indexOf(subscriber) === -1)  {
      this._channels[channel].subscribers.push(subscriber);
    }
    return true; 
  } else return false;
}

// regexp subscribe. 
Hub.prototype.Psub = function (pattern, subscriber)  {
  var matches = [];

  p = new RegExp(pattern, 'i');
  for (var t in this._channels)  {
    if (p.test(t))  {
      if (!this.authorize(t, 'Sub', subscriber)) continue;
      if (this._channels[t].subscribers.indexOf(subscriber) === -1)  {
        this._channels[t].subscribers.push(subscriber);
      }
      matches.push(t);
    }
  }
  console.log('Psub: ' + pattern);
  return matches; 
}

// unsubscribe. Do not delete empty channels
Hub.prototype.unsub = function (channel, subscriber)  {
  if (channel in this._channels)  {
    var i = this._channels[channel].subscribers.indexOf(subscriber);
    if (i !== -1)  {
      this._channels[channel].subscribers.splice(i, 1);
    }
    console.log('unsub: ' + channel);
    return true;
  } else return false
}

// regexp unsubscribe. 
Hub.prototype.Punsub = function (pattern, subscriber)  {
  var matches = [];
  p = new RegExp(channel, 'i');
  for (var t in this._channels)  {
    if (p.test(t))  {
      var i = this._channels[t].subscribers.indexOf(subscriber);
      if (i !== -1)  {
        this._channels[t].subscribers.splice(i, 1);
      }
      matches.push(t);
    }
  }
  console.log('Punsub: ' + channel);
  return matches;
}

Hub.prototype.loopback = function (channel, body, options) {
  msg = {};
  msg.answerMe = false;
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.channel = channel;
  msg.body = body;
  msg.stamps = [];
  msg._id = this._id + '-' + this._msgCount++;
  return this.pub (msg, this);
}

// publish. 
Hub.prototype.pub = function (msg, publisher) {
  if (msg.channel in this._channels) {
    if (!this.authorize(msg.channel, 'Pub', publisher)) return false;
    if (msg.answerMe)  {
      var reChannel = '_re:' + msg._id;
      this.createChannel(reChannel);
      this.sub (reChannel, publisher);
      this._channels[reChannel].re = true;
      that = this;
      setTimeout (function () { that.deleteChannel(reChannel); }, msg.ttl ? msg.ttl : 1000);
    }
    if (this._channels[msg.channel].re)  {
      this._channels[msg.channel].subscribers[0].recieve(msg);
      this.deleteChannel(msg.channel);
    }
    msg.stamps.push(this);
    for (var s in this._channels[msg.channel].subscribers)  {
      this._channels[msg.channel].subscribers[s].recieve(msg);
    }
    return true;
  } else return false;
}

Hub.prototype.log = function (anything)  {
  this.loopback ('_log', arguments);
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.pub;

/**
 * Public API.
 */

exports = module.exports = Hub;
