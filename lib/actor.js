

/**
 * Constructor.
 */

var Actor = function ()  {

}

/**
 * Methods.
 */

Actor.prototype.recieve = function (msg) {
	var that = this;
	process.nextTick (function ()  {
		that.process (msg, function () {
		})
	});
}

// override this in inherited objects to do useful things
Actor.prototype.process = function (msg, cb)  {
	cb();
}

Actor.prototype.sub = function (topic) {
	this.hub.sub (topic, this);
}

Actor.prototype.unsub = function (topic) {
	this.hub.unsub (topic, this);
}

Actor.prototype.pub = function (topic, body) {
	msg = {};
	msg.topic = topic;
	msg.body = body;
	msg._id = this._id + '-' + this._msgCount++;
	this.hub.pub (msg, this);
}

/**
 * Public API.
 */

exports = module.exports = Actor;
