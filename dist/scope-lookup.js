"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _multimap = require("multimap");

var _multimap2 = _interopRequireDefault(_multimap);

var _scope = require("./scope");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeLookup = (function () {
  function ScopeLookup(globalScope) {
    var _this = this;

    _classCallCheck(this, ScopeLookup);

    this.scope = globalScope;
    this.variableMap = new _multimap2.default();

    var addVariable = function addVariable(v) {
      v.declarations.forEach(function (decl) {
        return _this.variableMap.set(decl.node, v);
      });
      v.references.forEach(function (ref) {
        if (!_this.variableMap.has(ref.node) || _this.variableMap.get(ref.node).indexOf(v) === -1) {
          _this.variableMap.set(ref.node, v);
        }
      });
    };
    (function addVariables(scope) {
      scope.children.forEach(addVariables);
      scope.variables.forEach(addVariable);
    })(globalScope);
  }

  _createClass(ScopeLookup, [{
    key: "lookup",
    value: function lookup(node) {
      /* Gives a map from BindingIdentifiers and IdentifierExpressions to a list of Variables.
      Assuming that the given node is defined in the scope, the map always returns at least one Variable.
      It will return two in precisely two cases:
      `try{}catch(e){var e = ...}`, and function declarations in blocks for which annex B.3.3 applies.
      In this case the same identifier refers to two variables, one var-scoped and one block-scoped.
      Both are returned, with the block-scoped variable being returned first. */
      return this.variableMap.get(node);
    }
  }, {
    key: "isGlobal",
    value: function isGlobal(node) {
      return this.scope instanceof _scope.GlobalScope && this.scope.has(node);
    }
  }]);

  return ScopeLookup;
})();

exports.default = ScopeLookup;