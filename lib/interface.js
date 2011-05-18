/**
 * Module dependencies.
 */

var Actor = require('./actor');

/**
 * Constructor.
 */

var Interface = function (id)  {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
 	this.id = id;
}

/**
 * Inherits Actor.
 */

Interface.prototype.__proto__ = Actor.prototype;

/**
 * Methods.
 */

Interface.prototype.process = function (msg, cb)  {
	console.log('' + this.id + 'Interface processing message #' + msg.id + ', ' + msg.channel + ', ' + msg.body);
	cb();
}

/**
 * Public API.
 */

exports = module.exports = Interface;
