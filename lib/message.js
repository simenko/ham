/**
 * Constructor.
 */
 
var total = 0;

var Message = function (topic, body)  {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
	this.topic = topic;
	this.body = body;
	this.id = ++total;
}

/**
 * Public API.
 */

exports = module.exports = Message;
