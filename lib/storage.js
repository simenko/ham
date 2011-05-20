/**
 * Module dependencies.
 */

var Actor = require('./actor');
var uuid = require('node-uuid');



/**
 * Constructor.
 */

var Storage = function (hub)  {
 	this._id = uuid();
 	this._msgCount = 0;
 	this.hub = hub;
 	this.db = {};
	this.stored = 0;
}

/**
 * Inherits Actor.
 */

Storage.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

/*Storage.prototype.process = function (msg, cb)  {
	console.log('' + this._id + 'Storage processing message #' + msg._id + ', ' + msg.topic);
	switch (msg.topic)  {
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
*/
/**
 * Public API.
 */

exports = module.exports = Storage;
