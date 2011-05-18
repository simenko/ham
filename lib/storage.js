/**
 * Module dependencies.
 */

var Actor = require('./actor');

var storage = {};
var stored = 0;

/**
 * Constructor.
 */

var Storage = function (id)  {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
 	this.id = id;
}

/**
 * Inherits Actor.
 */

Storage.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Storage.prototype.process = function (msg, cb)  {
	console.log('' + this.id + 'Storage processing message #' + msg.id + ', ' + msg.channel);
	switch (msg.channel)  {
	case 'storage.create':
		storage[msg.body.key] = msg.body.value;
		stored++;
		console.log(stored);
		cb();
		break;
	case 'storage.delete':
		delete storage[msg.body.key];
		stored--;
		console.log(stored);
		cb();
		break;
	}
}

/**
 * Public API.
 */

exports = module.exports = Storage;
