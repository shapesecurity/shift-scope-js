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
ScopeType.MODULE = new ScopeType("module");
ScopeType.SCRIPT = new ScopeType("script");
ScopeType.ARROW_FUNCTION = new ScopeType("arrow function");
ScopeType.FUNCTION = new ScopeType("function");
ScopeType.FUNCTION_NAME = new ScopeType("function name");
ScopeType.PARAMETERS = new ScopeType("parameters");
ScopeType.PARAMETER_EXPRESSION = new ScopeType("parameter expression");
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
//# sourceMappingURL=data:application/json;base64,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LFdBQVgsV0FBVztBQUNYLFdBREEsV0FBVyxDQUNWLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTs7OzBCQUR4QyxXQUFXOztBQUVwQiwrQkFGUyxXQUFXLDZDQUVkLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUNyRSxXQUFPLENBQUMsWUFBWSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixZQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMvQyxDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7Ozs7O0FBQ3ZCLDJCQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQTVCLENBQUM7O0FBQ1AsWUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDM0I7Ozs7Ozs7Ozs7Ozs7OztHQUNGOztZQVZVLFdBQVc7O1NBQVgsV0FBVztHQUFTLEtBQUsiLCJmaWxlIjoic3JjL3Njb3BlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBTaGFwZSBTZWN1cml0eSwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCAqIGFzIE1hcCBmcm9tIFwiZXM2LW1hcFwiO1xuaW1wb3J0IFZhcmlhYmxlIGZyb20gXCIuL3ZhcmlhYmxlXCI7XG5cbmV4cG9ydCBjbGFzcyBTY29wZVR5cGUge1xuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxufVxuXG5TY29wZVR5cGUuR0xPQkFMID0gbmV3IFNjb3BlVHlwZShcImdsb2JhbFwiKTtcblNjb3BlVHlwZS5NT0RVTEUgPSBuZXcgU2NvcGVUeXBlKFwibW9kdWxlXCIpO1xuU2NvcGVUeXBlLlNDUklQVCA9IG5ldyBTY29wZVR5cGUoXCJzY3JpcHRcIik7XG5TY29wZVR5cGUuQVJST1dfRlVOQ1RJT04gPSBuZXcgU2NvcGVUeXBlKFwiYXJyb3cgZnVuY3Rpb25cIik7XG5TY29wZVR5cGUuRlVOQ1RJT04gPSBuZXcgU2NvcGVUeXBlKFwiZnVuY3Rpb25cIik7XG5TY29wZVR5cGUuRlVOQ1RJT05fTkFNRSA9IG5ldyBTY29wZVR5cGUoXCJmdW5jdGlvbiBuYW1lXCIpO1xuU2NvcGVUeXBlLlBBUkFNRVRFUlMgPSBuZXcgU2NvcGVUeXBlKFwicGFyYW1ldGVyc1wiKTtcblNjb3BlVHlwZS5QQVJBTUVURVJfRVhQUkVTU0lPTiA9IG5ldyBTY29wZVR5cGUoXCJwYXJhbWV0ZXIgZXhwcmVzc2lvblwiKTtcblNjb3BlVHlwZS5XSVRIID0gbmV3IFNjb3BlVHlwZShcIndpdGhcIik7XG5TY29wZVR5cGUuQ0FUQ0ggPSBuZXcgU2NvcGVUeXBlKFwiY2F0Y2hcIik7XG5TY29wZVR5cGUuQkxPQ0sgPSBuZXcgU2NvcGVUeXBlKFwiYmxvY2tcIik7XG5cbmV4cG9ydCBjbGFzcyBTY29wZSB7XG4gIGNvbnN0cnVjdG9yKGNoaWxkcmVuLCB2YXJpYWJsZXMsIHRocm91Z2gsIHR5cGUsIGlzRHluYW1pYywgYXN0Tm9kZSkge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB0aGlzLnRocm91Z2ggPSB0aHJvdWdoO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5hc3ROb2RlID0gYXN0Tm9kZTtcblxuICAgIHRoaXMudmFyaWFibGVzID0gbmV3IE1hcDtcbiAgICB2YXJpYWJsZXMuZm9yRWFjaCh2ID0+IHRoaXMudmFyaWFibGVzLnNldCh2Lm5hbWUsIHYpKTtcblxuICAgIHRoaXMudmFyaWFibGVMaXN0ID0gW107XG4gICAgZm9yKGxldCB4IG9mIHRoaXMudmFyaWFibGVzLnZhbHVlcygpKSB7XG4gICAgICB0aGlzLnZhcmlhYmxlTGlzdC5wdXNoKHgpO1xuICAgIH1cblxuICAgIHRoaXMuZHluYW1pYyA9IGlzRHluYW1pYyB8fCB0eXBlID09PSBTY29wZVR5cGUuV0lUSCB8fCB0eXBlID09PSBTY29wZVR5cGUuR0xPQkFMO1xuICB9XG5cbiAgaXNHbG9iYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gU2NvcGVUeXBlLkdMT0JBTDtcbiAgfVxuXG4gIGxvb2t1cFZhcmlhYmxlKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YXJpYWJsZXMuZ2V0KG5hbWUpO1xuICB9XG5cbiAgZmluZFZhcmlhYmxlcyhpZGVudGlmaWVyKSB7XG4gICAgLy8gVE9ET1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHbG9iYWxTY29wZSBleHRlbmRzIFNjb3BlIHtcbiAgY29uc3RydWN0b3IoY2hpbGRyZW4sIHZhcmlhYmxlcywgdGhyb3VnaCwgYXN0Tm9kZSkge1xuICAgIHN1cGVyKGNoaWxkcmVuLCB2YXJpYWJsZXMsIHRocm91Z2gsIFNjb3BlVHlwZS5HTE9CQUwsIHRydWUsIGFzdE5vZGUpO1xuICAgIHRocm91Z2guZm9yRWFjaEVudHJ5KCh2LCBrKSA9PiB7XG4gICAgICB0aGlzLnZhcmlhYmxlcy5zZXQoaywgbmV3IFZhcmlhYmxlKGssIHYsIFtdKSk7XG4gICAgfSk7XG4gICAgdGhpcy52YXJpYWJsZUxpc3QgPSBbXTtcbiAgICBmb3IobGV0IHggb2YgdGhpcy52YXJpYWJsZXMudmFsdWVzKCkpIHtcbiAgICAgIHRoaXMudmFyaWFibGVMaXN0LnB1c2goeCk7XG4gICAgfVxuICB9XG59XG4iXX0=