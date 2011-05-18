/**
 * Module dependencies.
 */

var Actor = require('./actor');

/**
 * Constructor.
 */

var Processor = function (id)  {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
 	this.id = id;
}

/**
 * Inherits Actor.
 */

Processor.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Processor.prototype.process = function (msg, cb)  {
	console.log('' + this.id + 'Processor processing message #' + msg.id + ', ' + msg.channel + ', ' + msg.body);
	cb();
}
 
/**
 * Public API.
 */

exports = module.exports = Processor;
