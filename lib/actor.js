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

Actor.prototype.sub = function (channel, hub) {
	hub.sub (channel, this);
}

Actor.prototype.pub = function (msg, hub) {
	hub.pub (msg, this);
}

/**
 * Public API.
 */

exports = module.exports = Actor;
