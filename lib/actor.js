var _ = require('../underscore')._;

/**
 * Constructor.
 */

var Actor = function ()  {}

/**
 * Methods.
 */

Actor.prototype.recieve = function (msg) {}

Actor.prototype.sub = function (topic)  {
  return this.hub.sub (topic, this);
}

Actor.prototype.Psub = function (topic)  {
  return this.hub.Psub (topic, this);
}

Actor.prototype.unsub = function (topic)  {
  return this.hub.unsub (topic, this);
}

Actor.prototype.Punsub = function (topic)  {
  return this.hub.Punsub (topic, this);
}

Actor.prototype.pub = function (topic, body, options) {
  msg = {};
  msg.ack = false;
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.topic = topic;
  msg.body = body;
  msg.stamps = [];
  msg._id = this._id + '-' + this._msgCount++;
  return this.hub.pub (msg, this);
}

/**
 * Public API.
 */

exports = module.exports = Actor;
