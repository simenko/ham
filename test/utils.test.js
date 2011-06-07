var assert = require('assert'),
    should = require('should'),
    utils = require('utils'),
    _ = require('../underscore');
    
module.exports = {
 'test createMessage': function()  {
    var options = {
      answerMe: true,
      ttl: 3000,
      channel: 'foo'
    };
    var msg = utils.createMessage('bar', 'blabla', options);
    msg.should.have.keys('answerMe','ttl', 'channel', 'body');
    msg.answerMe.should.be.true;
    msg.ttl.should.equal(3000);
    msg.channel.should.equal('bar');
    msg.body.should.equal('blabla');
  },
  
 'deepExtend': function()  {
   var dest = {};
   var source = {
      a: 1,
      b: {
          c: 2,
          d: {
              e:3
              }
          }
   }
   utils.deepExtend(dest, source)
   _.isEqual(dest, source).should.be.true;
   dest.aa = 4;
   dest.aaa = {x: 5};
   dest.b.bb = 6;
   var temp = {
      a: 1,
      aa: 4,
      aaa: {x: 5},
      b: {
          bb: 6,
          c: 2,
          d: {
              e:3
              }
          }
   }
   utils.deepExtend(dest, source);
   _.isEqual(dest, temp).should.be.true;
 }
}    
