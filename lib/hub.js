/**
 * Constructor.
 */

var Hub = function (id) {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
 	this.id = id
	this.channels = {};
};

/**
 * Methods.
 */

Hub.prototype.sub = function (channel, subscriber)  {
	if (channel in this.channels)   {
		this.channels[channel].push(subscriber);
		return;
	}
	this.channels[channel] = [];
	this.channels[channel].push(subscriber);
}

Hub.prototype.pub = function (msg, publisher) {
	if (msg.channel in this.channels)	{
		for (var s in this.channels[msg.channel])  {
			this.channels[msg.channel][s].recieve(msg);
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
