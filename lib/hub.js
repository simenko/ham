var uuid = require('node-uuid');

/**
 * Constructor.
 */

var Hub = function () {
 	this._id = uuid();
	this.topics = {};
	this.reTopics = {};
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
	if (topic in this.reTopics)  {
		this.reTopics[topic].subscribers.push(subscriber);
		return;
	}
	this.reTopics[topic] = {
		subscribers: []
	};
	this.reTopics[topic].subscribers.push(subscriber);
}

Hub.prototype.unsub = function (topic, subscriber)  {
	if (global.debug) console.log('unsub: ' + topic);
	if (topic in this.topics)   {
		var i = this.topics[topic].subscribers.indexOf(subscriber);
		if (i !== -1)  {
			this.topics[topic].subscribers.splice(i, 1);
		}
	}
	if (topic in this.reTopics)   {
		var ri = this.reTopics[topic].subscribers.indexOf(subscriber);
		if (ri !== -1)  {
			this.reTopics[topic].subscribers.splice(ri, 1);
		}
	}
}

Hub.prototype.pub = function (msg, publisher) {
	if (global.debug) console.log('pub: ' + msg.topic);
	var pattern;
	if (msg.topic in this.topics)	{
		for (var s in this.topics[msg.topic].subscribers)  {
			this.topics[msg.topic].subscribers[s].recieve(msg);
		}
	}
	for (var re in this.reTopics) {
		pattern = new RegExp (re, 'i');
		if (pattern.test(msg.topic))  {
			for (var s in this.reTopics[re].subscribers)  {
				this.reTopics[re].subscribers[s].recieve(msg);
			}
		}
	}
}

Hub.prototype.recieve = Hub.prototype.pub;  // alias for interhub communication

/**
 * Public API.
 */

exports = module.exports = Hub;
