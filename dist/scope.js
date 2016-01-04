"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GlobalScope = exports.Scope = exports.ScopeType = undefined;

var _es6Map = require("es6-map");

var _es6Map2 = _interopRequireDefault(_es6Map);

var _variable = require("./variable");

var _variable2 = _interopRequireDefault(_variable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Copyright 2015 Shape Security, Inc.
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
ScopeType.CLASS_NAME = new ScopeType("class name"); // class expressions, in particular

var Scope = exports.Scope = (function () {
  function Scope(children, variables, through, type, isDynamic, astNode) {
    var _this = this;

    _classCallCheck(this, Scope);

    this.children = children;
    this.through = through;
    this.type = type;
    this.astNode = astNode;

    this.variables = new _es6Map2.default();
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
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    this.dynamic = isDynamic || type === ScopeType.WITH || type === ScopeType.GLOBAL;
  }

  _createClass(Scope, [{
    key: "isGlobal",
    value: function isGlobal() {
      return this.type === ScopeType.GLOBAL;
    }
  }, {
    key: "lookupVariable",
    value: function lookupVariable(name) {
      return this.variables.get(name);
    }
  }, {
    key: "findVariables",
    value: function findVariables(identifier) {
      // TODO
    }
  }]);

  return Scope;
})();

var GlobalScope = exports.GlobalScope = (function (_Scope) {
  _inherits(GlobalScope, _Scope);

  function GlobalScope(children, variables, through, astNode) {
    _classCallCheck(this, GlobalScope);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(GlobalScope).call(this, children, variables, through, ScopeType.GLOBAL, true, astNode));

    through.forEachEntry(function (v, k) {
      _this2.variables.set(k, new _variable2.default(k, v, []));
    });
    _this2.variableList = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _this2.variables.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var x = _step2.value;

        _this2.variableList.push(x);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return _this2;
  }

  return GlobalScope;
})(Scope);