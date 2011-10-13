var assert = require('assert'),
    should = require('should'),
    Hub = require('hub');

    
module.exports = {
 'test _aux channel': function()  {
    var hub = new Hub('hub');
    
    hub.$._aux[hub.id()].pub.should.be.true;    
 },
 
 'test id getter': function()  {
    var hub = new Hub('hub');
    
    hub.id().should.equal(hub._id)
  },
  
 'test setupChannel': function()  {
    var hub = new Hub('hub');
    
    hub.setupChannel(1).should.not.be.ok;  
    
    hub.setupChannel('test').should.be.ok;
    hub.$.should.have.property('test');
    
    hub.setupChannel('test',
                     { someActor: {pub: true} }).should.be.ok;
    hub.$.test.someActor.pub.should.be.true;
  },
  
 'test allow and deny': function()  {
    var hub = new Hub('hub');
    hub.setupChannel('test');
    
    hub.allow('someActor', 'sub', 'test');
    hub.$.test.someActor.sub.should.be.true;
    
    hub.deny('someOtherActor', 'sub', 'test');
    hub.$.test.someOtherActor.sub.should.be.false;
    
    hub.setupChannel('test2', {_open_pub: true});
    hub.deny('foo', 'pub', 'test2').should.not.be.ok;
   // console.log(hub.dump());    
  },
  
 'test bulkAllow bulkDeny': function()  {
    var hub = new Hub('hub');
    hub.setupChannel('test');
    hub.setupChannel('test2');

    hub.bulkAllow(['a', 'b', 'c'], 'sub', ['test', 'test2']);
    hub.$.test.should.have.keys('a', 'b', 'c');
    hub.$.test2.should.have.keys('a', 'b', 'c');
    
    hub.bulkDeny(['a', 'b'], 'sub', ['test2']);
    hub.$.test2.a.sub.should.be.false;
    hub.$.test2.b.sub.should.be.false;
    hub.$.test2.c.sub.should.be.true;
 },
  
 'test deleteChannel': function()  {
    var hub = new Hub('hub');
    hub.setupChannel('test');
    
    hub.deleteChannel(1).should.not.be.ok;
    
    hub.deleteChannel('test').should.be.ok;
    hub.should.not.have.property('test');
  },
 
 'test authorize': function()  {
    var hub = new Hub('hub');
    hub.setupChannel('test',
                     { publisher: {pub: true} }).should.be.ok;
    hub.authorize('publisher', 'pub', 'test').should.be.ok;
    hub.authorize('publisher', 'sub', 'test').should.not.be.ok;
    hub.authorize('ddddddddd', 'pub', 'test').should.not.be.ok;
    hub.authorize('ddddddddd', 'ddd', 'trrest').should.not.be.ok;                
 }
}    
