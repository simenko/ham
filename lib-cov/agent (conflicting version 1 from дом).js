/* automatically generated by JSCoverage - do not edit */
if (typeof _$jscoverage === 'undefined') _$jscoverage = {};
if (! _$jscoverage['agent.js']) {
  _$jscoverage['agent.js'] = [];
  _$jscoverage['agent.js'][5] = 0;
  _$jscoverage['agent.js'][6] = 0;
  _$jscoverage['agent.js'][7] = 0;
  _$jscoverage['agent.js'][8] = 0;
  _$jscoverage['agent.js'][11] = 0;
  _$jscoverage['agent.js'][12] = 0;
  _$jscoverage['agent.js'][13] = 0;
  _$jscoverage['agent.js'][14] = 0;
  _$jscoverage['agent.js'][15] = 0;
  _$jscoverage['agent.js'][22] = 0;
  _$jscoverage['agent.js'][25] = 0;
}
_$jscoverage['agent.js'][5]++;
var Actor = require("./actor");
_$jscoverage['agent.js'][6]++;
if (typeof uuid === "undefined") {
  _$jscoverage['agent.js'][7]++;
  var _uuid = require("node-uuid");
}
else {
  _$jscoverage['agent.js'][8]++;
  _uuid = uuid;
}
_$jscoverage['agent.js'][11]++;
var Agent = (function () {
  _$jscoverage['agent.js'][12]++;
  this._id = _uuid();
  _$jscoverage['agent.js'][13]++;
  this._msgCount = 0;
  _$jscoverage['agent.js'][14]++;
  this.hub = null;
  _$jscoverage['agent.js'][15]++;
  this._listeners = {};
});
_$jscoverage['agent.js'][22]++;
Agent.prototype = new Actor();
_$jscoverage['agent.js'][25]++;
exports = module.exports = Agent;
_$jscoverage['agent.js'].source = ["/**"," * Module dependencies."," */","","var Actor = require('./actor');","if (typeof uuid === 'undefined')","  var _uuid = require('node-uuid');","else _uuid = uuid;","","","var Agent = function () {","  this._id = _uuid();  ","  this._msgCount = 0;","  this.hub = null;","  this._listeners = {}; ","}","","/**"," * Inherits Actor."," */","","Agent.prototype = new Actor;","","","exports = module.exports = Agent;"];
