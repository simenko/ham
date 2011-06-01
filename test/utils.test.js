var assert = require('assert'),
    should = require('should'),
    utils = require('utils');
    
module.exports = {
 'test createMessage': function()  {
    var options = {
      answerMe: true,
      ttl: 3000,
      channel: 'foo'
    }
    var msg = utils.createMessage('bar', 'blabla', options);
    msg.should.have.keys('answerMe','ttl', 'channel', 'body');
    msg.answerMe.should.be.true;
    msg.ttl.should.equal(3000);
    msg.channel.should.equal('bar');
    msg.body.should.equal('blabla');
  }
}    
