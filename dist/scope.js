"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Copyright 2014 Shape Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Map = require("es6-map");

var Variable = require("./variable")["default"];

var ScopeType = exports.ScopeType = function ScopeType(name) {
  _classCallCheck(this, ScopeType);

  this.name = name;
};

ScopeType.GLOBAL = new ScopeType("global");
ScopeType.FUNCTION = new ScopeType("function");
ScopeType.FUNCTION_NAME = new ScopeType("function name");
ScopeType.WITH = new ScopeType("with");
ScopeType.CATCH = new ScopeType("catch");
ScopeType.BLOCK = new ScopeType("block");

var Scope = exports.Scope = (function () {
  function Scope(children, variables, through, type, isDynamic, astNode) {
    var _this = this;

    _classCallCheck(this, Scope);

    this.children = children;
    this.through = through;
    this.type = type;
    this.astNode = astNode;

    this.variables = new Map();
    variables.forEach(function (v) {
      return _this.variables.set(v.name, v);
    });

    this.variableList = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.variables.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var x = _step.value;

        this.variableList.push(x);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    this.dynamic = isDynamic || type === ScopeType.WITH || type === ScopeType.GLOBAL;
  }

  _createClass(Scope, {
    isGlobal: {
      value: function isGlobal() {
        return this.type === ScopeType.GLOBAL;
      }
    },
    lookupVariable: {
      value: function lookupVariable(name) {
        return this.variables.get(name);
      }
    },
    findVariables: {
      value: function findVariables(identifier) {}
    }
  });

  return Scope;
})();

var GlobalScope = exports.GlobalScope = (function (_Scope) {
  function GlobalScope(children, variables, through, astNode) {
    var _this = this;

    _classCallCheck(this, GlobalScope);

    _get(Object.getPrototypeOf(GlobalScope.prototype), "constructor", this).call(this, children, variables, through, ScopeType.GLOBAL, true, astNode);
    through.forEachEntry(function (v, k) {
      _this.variables.set(k, new Variable(k, v, []));
    });
    this.variableList = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.variables.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var x = _step.value;

        this.variableList.push(x);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _inherits(GlobalScope, _Scope);

  return GlobalScope;
})(Scope);

// TODO
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY29wZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWdCWSxHQUFHLFdBQU0sU0FBUzs7SUFDdkIsUUFBUSxXQUFNLFlBQVk7O0lBRXBCLFNBQVMsV0FBVCxTQUFTLEdBQ1QsU0FEQSxTQUFTLENBQ1IsSUFBSSxFQUFFO3dCQURQLFNBQVM7O0FBRWxCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ2xCOztBQUdILFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxTQUFTLENBQUMsYUFBYSxHQUFHLElBQUksU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pELFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztJQUU1QixLQUFLLFdBQUwsS0FBSztBQUNMLFdBREEsS0FBSyxDQUNKLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFOzs7MEJBRHpELEtBQUs7O0FBRWQsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUEsQ0FBQztBQUN6QixhQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQzthQUFJLE1BQUssU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7Ozs7OztBQUN2QiwyQkFBYSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUE1QixDQUFDOztBQUNQLFlBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzNCOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsUUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUM7R0FDbEY7O2VBaEJVLEtBQUs7QUFrQmhCLFlBQVE7YUFBQSxvQkFBRztBQUNULGVBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQ3ZDOztBQUVELGtCQUFjO2FBQUEsd0JBQUMsSUFBSSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDakM7O0FBRUQsaUJBQWE7YUFBQSx1QkFBQyxVQUFVLEVBQUUsRUFFekI7Ozs7U0E1QlUsS0FBSzs7O0lBK0JMLFdBQVcsV0FBWCxXQUFXO0FBQ1gsV0FEQSxXQUFXLENBQ1YsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFOzs7MEJBRHhDLFdBQVc7O0FBRXBCLCtCQUZTLFdBQVcsNkNBRWQsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3JFLFdBQU8sQ0FBQyxZQUFZLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQzdCLFlBQUssU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQy9DLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDOzs7Ozs7QUFDdkIsMkJBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFBNUIsQ0FBQzs7QUFDUCxZQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMzQjs7Ozs7Ozs7Ozs7Ozs7O0dBQ0Y7O1lBVlUsV0FBVzs7U0FBWCxXQUFXO0dBQVMsS0FBSyIsImZpbGUiOiJzcmMvc2NvcGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE0IFNoYXBlIFNlY3VyaXR5LCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgTWFwIGZyb20gXCJlczYtbWFwXCI7XG5pbXBvcnQgVmFyaWFibGUgZnJvbSBcIi4vdmFyaWFibGVcIjtcblxuZXhwb3J0IGNsYXNzIFNjb3BlVHlwZSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG59XG5cblNjb3BlVHlwZS5HTE9CQUwgPSBuZXcgU2NvcGVUeXBlKFwiZ2xvYmFsXCIpO1xuU2NvcGVUeXBlLkZVTkNUSU9OID0gbmV3IFNjb3BlVHlwZShcImZ1bmN0aW9uXCIpO1xuU2NvcGVUeXBlLkZVTkNUSU9OX05BTUUgPSBuZXcgU2NvcGVUeXBlKFwiZnVuY3Rpb24gbmFtZVwiKTtcblNjb3BlVHlwZS5XSVRIID0gbmV3IFNjb3BlVHlwZShcIndpdGhcIik7XG5TY29wZVR5cGUuQ0FUQ0ggPSBuZXcgU2NvcGVUeXBlKFwiY2F0Y2hcIik7XG5TY29wZVR5cGUuQkxPQ0sgPSBuZXcgU2NvcGVUeXBlKFwiYmxvY2tcIik7XG5cbmV4cG9ydCBjbGFzcyBTY29wZSB7XG4gIGNvbnN0cnVjdG9yKGNoaWxkcmVuLCB2YXJpYWJsZXMsIHRocm91Z2gsIHR5cGUsIGlzRHluYW1pYywgYXN0Tm9kZSkge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB0aGlzLnRocm91Z2ggPSB0aHJvdWdoO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5hc3ROb2RlID0gYXN0Tm9kZTtcblxuICAgIHRoaXMudmFyaWFibGVzID0gbmV3IE1hcDtcbiAgICB2YXJpYWJsZXMuZm9yRWFjaCh2ID0+IHRoaXMudmFyaWFibGVzLnNldCh2Lm5hbWUsIHYpKTtcblxuICAgIHRoaXMudmFyaWFibGVMaXN0ID0gW107XG4gICAgZm9yKGxldCB4IG9mIHRoaXMudmFyaWFibGVzLnZhbHVlcygpKSB7XG4gICAgICB0aGlzLnZhcmlhYmxlTGlzdC5wdXNoKHgpO1xuICAgIH1cblxuICAgIHRoaXMuZHluYW1pYyA9IGlzRHluYW1pYyB8fCB0eXBlID09PSBTY29wZVR5cGUuV0lUSCB8fCB0eXBlID09PSBTY29wZVR5cGUuR0xPQkFMO1xuICB9XG5cbiAgaXNHbG9iYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gU2NvcGVUeXBlLkdMT0JBTDtcbiAgfVxuXG4gIGxvb2t1cFZhcmlhYmxlKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YXJpYWJsZXMuZ2V0KG5hbWUpO1xuICB9XG5cbiAgZmluZFZhcmlhYmxlcyhpZGVudGlmaWVyKSB7XG4gICAgLy8gVE9ET1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHbG9iYWxTY29wZSBleHRlbmRzIFNjb3BlIHtcbiAgY29uc3RydWN0b3IoY2hpbGRyZW4sIHZhcmlhYmxlcywgdGhyb3VnaCwgYXN0Tm9kZSkge1xuICAgIHN1cGVyKGNoaWxkcmVuLCB2YXJpYWJsZXMsIHRocm91Z2gsIFNjb3BlVHlwZS5HTE9CQUwsIHRydWUsIGFzdE5vZGUpO1xuICAgIHRocm91Z2guZm9yRWFjaEVudHJ5KCh2LCBrKSA9PiB7XG4gICAgICB0aGlzLnZhcmlhYmxlcy5zZXQoaywgbmV3IFZhcmlhYmxlKGssIHYsIFtdKSk7XG4gICAgfSk7XG4gICAgdGhpcy52YXJpYWJsZUxpc3QgPSBbXTtcbiAgICBmb3IobGV0IHggb2YgdGhpcy52YXJpYWJsZXMudmFsdWVzKCkpIHtcbiAgICAgIHRoaXMudmFyaWFibGVMaXN0LnB1c2goeCk7XG4gICAgfVxuICB9XG59XG4iXX0=