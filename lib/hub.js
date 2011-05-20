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
	if (topic in this.topics)   {
		this.topics[topic].subscribers.push(subscriber);
		return;
	}
	this.topics[topic] = {
		subscribers: []
	};
	this.topics[topic].subscribers.push(subscriber);
}

Hub.prototype.msub = function (topic, subscriber)  {
	var e = topic.split('.');
	for (t in this.topics)  {
		var te = t.split('.');
		var limit = e.length;
		if (limit !== te.length) break;
		var matches = true;
		for (var i = 0; i < limit; i++)  {
			if (e[i] !== te[i] && e[i] !== '*')  {
				matches = false;
				break;
			} 
		}
		if (!matches)  {
			break;
		} else {
			this.topics[t].subscribers.push(subscriber);
		}
	}
}

Hub.prototype.unsub = function (topic, subscriber)  {
	if (topic in this.topics)   {
		this.topics[topic].subscribers.splice(this.topics[topic].subscribers.indexOf(subscriber), 1);
	}
}

Hub.prototype.pub = function (msg, publisher) {
	if (msg.topic in this.topics)	{
		for (var s in this.topics[msg.topic].subscribers)  {
			this.topics[msg.topic].subscribers[s].recieve(msg);
		}
	} else {
		return 'No subscribers!';
	}
}

Hub.prototype.recieve = Hub.prototype.pub;  // alias for interhub communication

/**
 * Public API.
 */

exports = module.exports = Hub;
