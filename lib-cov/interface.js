/* automatically generated by JSCoverage - do not edit */
if (typeof _$jscoverage === 'undefined') _$jscoverage = {};
if (! _$jscoverage['interface.js']) {
  _$jscoverage['interface.js'] = [];
  _$jscoverage['interface.js'][5] = 0;
  _$jscoverage['interface.js'][6] = 0;
  _$jscoverage['interface.js'][7] = 0;
  _$jscoverage['interface.js'][8] = 0;
  _$jscoverage['interface.js'][11] = 0;
  _$jscoverage['interface.js'][12] = 0;
  _$jscoverage['interface.js'][13] = 0;
  _$jscoverage['interface.js'][14] = 0;
  _$jscoverage['interface.js'][15] = 0;
  _$jscoverage['interface.js'][22] = 0;
  _$jscoverage['interface.js'][24] = 0;
}
_$jscoverage['interface.js'][5]++;
var Actor = require("./actor");
_$jscoverage['interface.js'][6]++;
if (typeof uuid === "undefined") {
  _$jscoverage['interface.js'][7]++;
  var _uuid = require("node-uuid");
}
else {
  _$jscoverage['interface.js'][8]++;
  _uuid = uuid;
}
_$jscoverage['interface.js'][11]++;
var Interface = (function () {
  _$jscoverage['interface.js'][12]++;
  this._id = _uuid();
  _$jscoverage['interface.js'][13]++;
  this._msgCount = 0;
  _$jscoverage['interface.js'][14]++;
  this.hub = null;
  _$jscoverage['interface.js'][15]++;
  this._listeners = {};
});
_$jscoverage['interface.js'][22]++;
Interface.prototype = new Actor();
_$jscoverage['interface.js'][24]++;
exports = module.exports = Interface;
_$jscoverage['interface.js'].source = ["/**"," * Module dependencies."," */","","var Actor = require('./actor');","if (typeof uuid === 'undefined')","  var _uuid = require('node-uuid');","else _uuid = uuid;","","","var Interface = function ()  {","  this._id = _uuid();","  this._msgCount = 0;","  this.hub = null;","  this._listeners = {};","}","","/**"," * Inherits Actor."," */","","Interface.prototype = new Actor;","","exports = module.exports = Interface;"];
