/**
 * Constructor.
 */
 
var total = 0;

var Message = function (channel, body)  {
	if ( !(this instanceof arguments.callee) )  {
 	   throw new Error("Constructor called as a function");
 	}
	this.channel = channel;
	this.body = body;
	this.id = ++total;
}

/**
 * Public API.
 */

exports = module.exports = Message;
