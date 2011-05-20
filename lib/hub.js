var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Hub = function () {
 	this._id = uuid();
	this.topics = {};
};

/**
 * Methods.
 */

Hub.prototype.sub = function (topic, subscriber)  {
	if (global.debug) console.log('sub: ' + topic);
	if (topic in this.topics)   {
		this.topics[topic].subscribers.push(subscriber);
		return;
	}
	this.topics[topic] = {
		subscribers: []
	};
	this.topics[topic].subscribers.push(subscriber);
}

Hub.prototype.rsub = function (topic, subscriber)  {
	if (global.debug) console.log('rsub: ' + topic);
	pattern = new RegExp(topic, 'i');
	for (t in this.topics)  {
		if (pattern.test(t))  {
			this.topics[t].subscribers.push(subscriber);
		}
	}
}

Hub.prototype.unsub = function (topic, subscriber)  {
	if (global.debug) console.log('unsub: ' + topic);
	if (topic in this.topics)   {
		var i = this.topics[topic].subscribers.indexOf(subscriber);
		if (i !== -1)  {
			this.topics[topic].subscribers.splice(i, 1);
		}
	}
}

Hub.prototype.pub = function (msg, publisher) {
	if (global.debug) console.log('pub: ' + msg.topic);
	if (msg.topic in this.topics)	{
		for (var s in this.topics[msg.topic].subscribers)  {
			this.topics[msg.topic].subscribers[s].recieve(msg);
		}
		if (s !== undefined) return;
	}
	throw new Error("No subscribers - cannot publish.");
}

Hub.prototype.recieve = Hub.prototype.pub;  // alias for interhub communication

/**
 * Public API.
 */

exports = module.exports = Hub;
