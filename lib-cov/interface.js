/* automatically generated by JSCoverage - do not edit */
if (typeof _$jscoverage === 'undefined') _$jscoverage = {};
if (! _$jscoverage['interface.js']) {
  _$jscoverage['interface.js'] = [];
  _$jscoverage['interface.js'][5] = 0;
  _$jscoverage['interface.js'][6] = 0;
  _$jscoverage['interface.js'][9] = 0;
  _$jscoverage['interface.js'][10] = 0;
  _$jscoverage['interface.js'][11] = 0;
  _$jscoverage['interface.js'][12] = 0;
  _$jscoverage['interface.js'][13] = 0;
  _$jscoverage['interface.js'][14] = 0;
  _$jscoverage['interface.js'][21] = 0;
  _$jscoverage['interface.js'][23] = 0;
}
_$jscoverage['interface.js'][5]++;
var Actor = require("./actor");
_$jscoverage['interface.js'][6]++;
var uuid = require("node-uuid");
_$jscoverage['interface.js'][9]++;
var Interface = (function (name) {
  _$jscoverage['interface.js'][10]++;
  this.name = name.toString();
  _$jscoverage['interface.js'][11]++;
  this._id = this.name + uuid().slice(0, 4);
  _$jscoverage['interface.js'][12]++;
  this._msgCount = 0;
  _$jscoverage['interface.js'][13]++;
  this.hub = null;
  _$jscoverage['interface.js'][14]++;
  this._listeners = {};
});
_$jscoverage['interface.js'][21]++;
Interface.prototype = new Actor();
_$jscoverage['interface.js'][23]++;
exports = module.exports = Interface;
_$jscoverage['interface.js'].source = ["/**"," * Module dependencies."," */","","var Actor = require('./actor');","var uuid = require('node-uuid');","","","var Interface = function (name)  {","  this.name = name.toString();","  this._id = this.name + uuid().slice(0,4);","  this._msgCount = 0;","  this.hub = null;","  this._listeners = {};","}","","/**"," * Inherits Actor."," */","","Interface.prototype = new Actor;","","exports = module.exports = Interface;"];