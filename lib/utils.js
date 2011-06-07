'use strict'
/**
 * Module dependencies.
 */
 
if (typeof uuid === 'undefined')
  var _uuid = require('node-uuid');
else _uuid = uuid;
var _ = require('../underscore');


/**
 * Constructs messages
 * 
 * @param {string} [channel] the channel
 * @param {any} [body] message body
 * @param {object} [options] options
 * @returns {object} message 
 */


_.createMessage = function (channel, body, options) {
  var msg = {};
  msg.answerMe = false; 
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.channel = channel;
  msg.body = body;
  return msg;
}

_.id = function() {return _uuid();};

_.deepExtend = function extend(dest, source) {
  for (var prop in source) 
    if (typeof dest[prop] !== 'object') 
      dest[prop] = source[prop];
    else 
      extend(dest[prop], source[prop]);
};

exports = module.exports = _;

