var _ = require('../underscore')._;

/**
 * Constructor.
 */

var Actor = function ()  {
}

/**
 * Methods.
 */

Actor.prototype.recieve = function (msg) {
  this._listeners[msg.channel].call(this, msg);
}

Actor.prototype.sub = function (channel, listener)  {
  if (this.hub.sub (channel, this))  {
    this._listeners[channel] = listener;
    return true;
  }
  return false;
}

Actor.prototype.Psub = function (pattern, listener)  {
  channels = this.hub.Psub (pattern, this)
  for (var c in channels)  {
    this._listeners[channels[c]] = listener;
  }
  if (c) return true;
  else return false;
}

Actor.prototype.unsub = function (channel)  {
  if (this.hub.unsub (channel, this))  {
    this._listeners[channel] = undefined;
    return true;
  }
  return false;
}

Actor.prototype.Punsub = function (pattern)  {
  channels = this.hub.Punsub (pattern, this)
  for (var c in channels)  {
    this._listeners[channels[c]] = undefined;
  }
  if (c) return true;
  else return false;
}

Actor.prototype.pub = function (channel, body, options) {
  msg = {};
  msg.answerMe = false;
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.channel = channel;
  msg.body = body;
  msg.stamps = [];
  msg._id = this._id + '-' + this._msgCount++;
  return this.hub.pub (msg, this);
}

/**
 * Public API.
 */

exports = module.exports = Actor;
