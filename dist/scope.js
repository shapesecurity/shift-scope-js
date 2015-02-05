"use strict";

var _extends = function (child, parent) {
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  child.__proto__ = parent;
};

var Map = require("es6-map");

var Variable = require("./variable")["default"];
var ScopeType = function ScopeType(name) {
  this.name = name;
};

exports.ScopeType = ScopeType;


ScopeType.GLOBAL = new ScopeType("global");
ScopeType.FUNCTION = new ScopeType("function");
ScopeType.FUNCTION_NAME = new ScopeType("function name");
ScopeType.WITH = new ScopeType("with");
ScopeType.CATCH = new ScopeType("catch");
ScopeType.BLOCK = new ScopeType("block");

var Scope = (function () {
  var Scope = function Scope(children, variables, through, type, isDynamic, astNode) {
    var _this = this;
    this.children = children;
    this.through = through;
    this.type = type;
    this.astNode = astNode;

    this.variables = new Map();
    variables.forEach(function (v) {
      return _this.variables.set(v.name, v);
    });

    this.variableList = [];
    for (var _iterator = this.variables.values()[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      var x = _step.value;
      this.variableList.push(x);
    }

    this.dynamic = isDynamic || type === ScopeType.WITH || type === ScopeType.GLOBAL;
  };

  Scope.prototype.isGlobal = function () {
    return this.type === ScopeType.GLOBAL;
  };

  Scope.prototype.lookupVariable = function (name) {
    return this.variables.get(name);
  };

  Scope.prototype.findVariables = function (identifier) {};

  return Scope;
})();

exports.Scope = Scope;
var GlobalScope = (function (Scope) {
  var GlobalScope = function GlobalScope(children, variables, through, astNode) {
    var _this2 = this;
    Scope.call(this, children, variables, through, ScopeType.GLOBAL, true, astNode);
    through.forEachEntry(function (v, k) {
      _this2.variables.set(k, new Variable(k, v, []));
    });
    this.variableList = [];
    for (var _iterator2 = this.variables.values()[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
      var x = _step2.value;
      this.variableList.push(x);
    }
  };

  _extends(GlobalScope, Scope);

  return GlobalScope;
})(Scope);

exports.GlobalScope = GlobalScope;
//# sourceMappingURL=data:application/json;base64,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QVMsS0FBSzs7U0FBekIsV0FBVztHQUFTLEtBQUs7O1FBQXpCLFdBQVcsR0FBWCxXQUFXIiwiZmlsZSI6InNyYy9zY29wZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgU2hhcGUgU2VjdXJpdHksIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBNYXAgZnJvbSBcImVzNi1tYXBcIjtcbmltcG9ydCBWYXJpYWJsZSBmcm9tIFwiLi92YXJpYWJsZVwiO1xuXG5leHBvcnQgY2xhc3MgU2NvcGVUeXBlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cbn1cblxuU2NvcGVUeXBlLkdMT0JBTCA9IG5ldyBTY29wZVR5cGUoXCJnbG9iYWxcIik7XG5TY29wZVR5cGUuRlVOQ1RJT04gPSBuZXcgU2NvcGVUeXBlKFwiZnVuY3Rpb25cIik7XG5TY29wZVR5cGUuRlVOQ1RJT05fTkFNRSA9IG5ldyBTY29wZVR5cGUoXCJmdW5jdGlvbiBuYW1lXCIpO1xuU2NvcGVUeXBlLldJVEggPSBuZXcgU2NvcGVUeXBlKFwid2l0aFwiKTtcblNjb3BlVHlwZS5DQVRDSCA9IG5ldyBTY29wZVR5cGUoXCJjYXRjaFwiKTtcblNjb3BlVHlwZS5CTE9DSyA9IG5ldyBTY29wZVR5cGUoXCJibG9ja1wiKTtcblxuZXhwb3J0IGNsYXNzIFNjb3BlIHtcbiAgY29uc3RydWN0b3IoY2hpbGRyZW4sIHZhcmlhYmxlcywgdGhyb3VnaCwgdHlwZSwgaXNEeW5hbWljLCBhc3ROb2RlKSB7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIHRoaXMudGhyb3VnaCA9IHRocm91Z2g7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmFzdE5vZGUgPSBhc3ROb2RlO1xuXG4gICAgdGhpcy52YXJpYWJsZXMgPSBuZXcgTWFwO1xuICAgIHZhcmlhYmxlcy5mb3JFYWNoKHYgPT4gdGhpcy52YXJpYWJsZXMuc2V0KHYubmFtZSwgdikpO1xuXG4gICAgdGhpcy52YXJpYWJsZUxpc3QgPSBbXTtcbiAgICBmb3IobGV0IHggb2YgdGhpcy52YXJpYWJsZXMudmFsdWVzKCkpIHtcbiAgICAgIHRoaXMudmFyaWFibGVMaXN0LnB1c2goeCk7XG4gICAgfVxuXG4gICAgdGhpcy5keW5hbWljID0gaXNEeW5hbWljIHx8IHR5cGUgPT09IFNjb3BlVHlwZS5XSVRIIHx8IHR5cGUgPT09IFNjb3BlVHlwZS5HTE9CQUw7XG4gIH1cblxuICBpc0dsb2JhbCgpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBTY29wZVR5cGUuR0xPQkFMO1xuICB9XG5cbiAgbG9va3VwVmFyaWFibGUobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnZhcmlhYmxlcy5nZXQobmFtZSk7XG4gIH1cblxuICBmaW5kVmFyaWFibGVzKGlkZW50aWZpZXIpIHtcbiAgICAvLyBUT0RPXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdsb2JhbFNjb3BlIGV4dGVuZHMgU2NvcGUge1xuICBjb25zdHJ1Y3RvcihjaGlsZHJlbiwgdmFyaWFibGVzLCB0aHJvdWdoLCBhc3ROb2RlKSB7XG4gICAgc3VwZXIoY2hpbGRyZW4sIHZhcmlhYmxlcywgdGhyb3VnaCwgU2NvcGVUeXBlLkdMT0JBTCwgdHJ1ZSwgYXN0Tm9kZSk7XG4gICAgdGhyb3VnaC5mb3JFYWNoRW50cnkoKHYsIGspID0+IHtcbiAgICAgIHRoaXMudmFyaWFibGVzLnNldChrLCBuZXcgVmFyaWFibGUoaywgdiwgW10pKTtcbiAgICB9KTtcbiAgICB0aGlzLnZhcmlhYmxlTGlzdCA9IFtdO1xuICAgIGZvcihsZXQgeCBvZiB0aGlzLnZhcmlhYmxlcy52YWx1ZXMoKSkge1xuICAgICAgdGhpcy52YXJpYWJsZUxpc3QucHVzaCh4KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==