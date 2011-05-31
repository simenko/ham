/**
 * Module dependencies.
 */

var _ = require('../underscore');

/**
 * Constructs messages
 * 
 * @param {string} [channel] the channel
 * @param {any} [body] message body
 * @param {object} [options] options
 * @returns {object} message 
 */


this.createMessage = function (channel, body, options) {
  msg = {};
  msg.answerMe = false; 
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.channel = channel;
  msg.body = body;
  return msg;
}
