var uuid = require('node-uuid');
var _ = require('../underscore')._;

/**
 * Constructor.
 */

var Hub = function () {
  this._id = uuid();
  this.topics = {};
  this.createTopic('_reports');
};

/**
 * Methods.
 */

Hub.prototype.createTopic = function (topic)  {
  console.log('Create: ' + topic);

  if ('string' === typeof topic)  {
    if (!(topic in this.topics))  {
        this.topics[topic] = { subscribers: [] };
    }
    return true;
  } else return false;
}

Hub.prototype.createTopics = function (topics)  {
  if (_.isArray(topics))  {
    for (t in topics)  {
      this.createTopic (topics[t]);
    }
  }
}

Hub.prototype.deleteTopic = function (topic)  {
  console.log ('Delete: ' + topic);
  
  if ('string' === typeof topic)  {
    if (topic in this.topics)  {
        this.topics[topic] = undefined;
    }
    return true;
  } else return false;
  
}

// subscribe. 
Hub.prototype.sub = function (topic, subscriber)  {
  console.log('sub: ' + topic);

  if (topic in this.topics)   {
    if (this.topics[topic].subscribers.indexOf(subscriber) === -1)  {
      this.topics[topic].subscribers.push(subscriber);
    }
    return true; 
  } else return false;
}

// regexp subscribe. 
Hub.prototype.Psub = function (topic, subscriber)  {
  console.log('Psub: ' + topic);
  var matches = [];
  
  pattern = new RegExp(topic, 'i');
  for (t in this.topics)  {
    if (pattern.test(t))  {
      if (this.topics[t].subscribers.indexOf(subscriber) === -1)  {
        this.topics[t].subscribers.push(subscriber);
      }
      matches.push(t);
    }
  }
  return matches; 
}

// unsubscribe. Do not delete empty topics
Hub.prototype.unsub = function (topic, subscriber)  {
  console.log('unsub: ' + topic);
  
  if (topic in this.topics)  {
    var i = this.topics[topic].subscribers.indexOf(subscriber);
    if (i !== -1)  {
      this.topics[topic].subscribers.splice(i, 1);
    }
    return true;
  } else return false
}

// regexp unsubscribe. 
Hub.prototype.Punsub = function (topic, subscriber)  {
  console.log('Punsub: ' + topic);
  
  var matches = [];
  pattern = new RegExp(topic, 'i');
  for (t in this.topics)  {
    if (pattern.test(t))  {
      var i = this.topics[t].subscribers.indexOf(subscriber);
      if (i !== -1)  {
        this.topics[t].subscribers.splice(i, 1);
      }
      matches.push(t);
    }
  }
  return matches;
}

Hub.prototype.report = function (body, options) {
  msg = {};
  msg.ack = false;
  msg.ttl = 1000;
  msg = _.extend(msg, options);
  // Do not set this manually
  msg.topic = '_reports';
  msg.body = body;
  msg.stamps = [];
  msg._id = this._id + '-' + this._msgCount++;
  return this.pub (msg, this);
}

// publish. 
Hub.prototype.pub = function (msg, publisher) {
  console.log('pub: ' + msg.topic);
  
  if (msg.topic in this.topics)    {
    if (msg.ack)  {
      var ackTopic = '_ack:' + msg._id;
      this.createTopic(ackTopic);
      this.sub (ackTopic, publisher);
      this.topics[ackTopic].ack = true;
      that = this;
      setTimeout (function () { that.deleteTopic(ackTopic); }, msg.ttl ? msg.ttl : 1000);
    }
    if (this.topics[msg.topic].ack)  {
      this.topics[msg.topic].subscribers[0].recieve(msg);
      this.deleteTopic(msg.topic);
    }
    msg.stamps.push(this._id);
    for (var s in this.topics[msg.topic].subscribers)  {
      this.topics[msg.topic].subscribers[s].recieve(msg);
    }
    return true;
  } else return false;
}

// alias for interhub communication
Hub.prototype.recieve = Hub.prototype.pub;

/**
 * Public API.
 */

exports = module.exports = Hub;
