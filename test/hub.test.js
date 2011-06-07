var assert = require('assert'),
    should = require('should'),
    Hub = require('hub');
    _ = require('utils');

module.exports = {
 'service channels': function()  {
    var hub = new Hub();
    
    hub.$[hub._out][hub.id()]._allowpub.should.be.true;    
    hub.$[hub._in][hub.id()]._allowsub.should.be.true;    
 },
 
 'id getter': function()  {
    var hub = new Hub();
    
    hub.id().should.equal(hub._id)
  },
 
 
 'deleteChannel': function()  {
    var hub = new Hub();
    hub.rules('allowSub', 'test', 'test');
    
    hub.deleteChannel(1).should.not.be.ok;
    
    hub.deleteChannel('test').should.be.ok;
    hub.$.should.not.have.property('test');
  },
  
 'rules and authorize': function()   {
   var hub = new Hub();
   hub.rules('allowSub', 'test', 'actor');
   hub.authorize('actor', 'sub', 'test').should.be.ok;
   hub.rules('denySub', 'test', 'actor');
   hub.authorize('actor', 'sub', 'test').should.not.be.ok;
   hub.rules('openSub', 'test');
   hub.authorize('actor', 'sub', 'test').should.be.ok;
   hub.rules('closeSub', 'test');
   hub.authorize('actor', 'sub', 'test').should.not.be.ok;
   hub.rules('allowPub', 'test', 'actor');
   hub.authorize('actor', 'pub', 'test').should.be.ok;
   hub.rules('denyPub', 'test', 'actor');
   hub.authorize('actor', 'pub', 'test').should.not.be.ok;
   hub.rules('openPub', 'test');
   hub.authorize('actor', 'pub', 'test').should.be.ok;
   hub.rules('closePub', 'test');
   hub.authorize('actor', 'pub', 'test').should.not.be.ok;
   
   hub.authorize('ddddddddd', 'pub', 'test').should.not.be.ok;
   hub.authorize('ddddddddd', 'ddd', 'trrest').should.not.be.ok;   
    
 },

 'subscribe and unsubscribe': function()  {
    var hub = new Hub();

    hub.rules('allowSub', 'test', 'subscriber');
    hub.rules('allowPub', 'test', hub);

    var subscriber = {
      id: function(){return this._id},
      _id: 'subscriber',
      receive: function(msg){this.gotMessage = true;},
      gotMessage: false
    }
    hub.subscribe('test', subscriber);
    hub.pub('test').should.be.ok;
    subscriber.gotMessage.should.be.true;
    subscriber.gotMessage = false;
    hub.unsubscribe('test', subscriber);
    hub.pub('test');
    subscriber.gotMessage.should.be.false;
 },
 
 'multisub': function()  {
    var hub = new Hub();

    hub.rules('allowSub', ['test', 'test2'], ['subscriber1', 'subscriber2']);
    hub.rules('allowPub', /.*/, hub);

    var subscriber1 = {
      _id: 'subscriber1',
      id: function(){return this._id;},
      receive: function(msg){this.gotMessage = msg.channel;},
      gotMessage: false
    };
    var subscriber2 = {
      _id: 'subscriber2',
      id: function(){return this._id;},
      receive: function(msg){this.gotMessage = msg.channel;},
      gotMessage: false
    };

    hub.multiSub (/.*/, [subscriber1]);
    hub.pub('test').should.be.ok;
    subscriber1.gotMessage.should.equal('test');
    hub.unsubscribe('test', subscriber1);
    hub.multiSub (['test', 'test2'], [subscriber1, subscriber2]);

    hub.pub('test').should.be.ok;
    subscriber1.gotMessage.should.equal('test');
    subscriber2.gotMessage.should.equal('test');
    hub.pub('test2').should.be.ok;
    subscriber1.gotMessage.should.equal('test2');
    subscriber2.gotMessage.should.equal('test2');
    
    hub.multiUnsub (/.*/, [subscriber2]);
    hub.pub('test');
    subscriber2.gotMessage.should.equal('test2');
    hub.multiUnsub (['test1', 'test2'], [subscriber1, subscriber2]);
    subscriber1.gotMessage = 0;
    hub.pub('test2');
    subscriber1.gotMessage.should.equal(0);
 },
 
 're: and ttl': function()  {
    var hub = new Hub();
    var responce;
    var subscriber = {
      id: function(){return this._id},
      _id: 'subscriber',
      receive: function(msg){
        this.gotMessage = true;
        var m = _.createMessage('_re:' + msg._id)
        hub.publish(m, this);
      },
      gotMessage: false
    }
    hub.receive = function(msg){responce = msg.channel}
    hub.rules('allowSub', 'test', subscriber);
    hub.rules('allowPub', 'test', hub);
    hub.subscribe('test', subscriber);
    
    hub.pub('test', 'foo', {answerMe: true, ttl: 100});
    responce.should.equal('_re:hub#0')
    // reChannel should be deleted in 100 mSec
    setTimeout(function(hub){return hub.$.should.have.property('_re:hub#0')}, 50, hub);
    setTimeout(function(hub){hub.$.should.not.have.property('_re:hub#0')}, 150, hub);    
 },
 
 'publish': function()  {
   var hub = new Hub();
   hub.pub('sefdse').should.not.be.ok;
 }
}    
