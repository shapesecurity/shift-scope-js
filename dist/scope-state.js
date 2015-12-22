"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _multimap = require("multimap");

var _multimap2 = _interopRequireDefault(_multimap);

var _declaration = require("./declaration");

var _reference = require("./reference");

var _scope = require("./scope");

var _variable = require("./variable");

var _variable2 = _interopRequireDefault(_variable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function merge(multiMap, otherMultiMap) {
  otherMultiMap.forEachEntry(function (v, k) {
    multiMap.set.apply(multiMap, [k].concat(v));
  });
  return multiMap;
}

function resolveArguments(freeIdentifiers, variables) {
  // todo
  var args = freeIdentifiers.get("arguments") || [];
  freeIdentifiers.delete("arguments");
  return variables.concat(new _variable2.default("arguments", args, []));
}

function resolveDeclarations(freeIdentifiers, decls, variables) {
  // todo
  decls.forEachEntry(function (declarations, name) {
    var references = freeIdentifiers.get(name) || [];
    variables = variables.concat(new _variable2.default(name, references, declarations));
    freeIdentifiers.delete(name);
  });
  return variables; // todo just modify variables in place?
}

var ScopeState = (function () {
  function ScopeState(_ref) {
    var _ref$freeIdentifiers = _ref.freeIdentifiers;
    var freeIdentifiers = _ref$freeIdentifiers === undefined ? new _multimap2.default() : _ref$freeIdentifiers;
    var _ref$functionScopedDe = _ref.functionScopedDeclarations;
    var functionScopedDeclarations = _ref$functionScopedDe === undefined ? new _multimap2.default() : _ref$functionScopedDe;
    var _ref$blockScopedDecla = _ref.blockScopedDeclarations;
    var blockScopedDeclarations = _ref$blockScopedDecla === undefined ? new _multimap2.default() : _ref$blockScopedDecla;
    var _ref$functionDeclarat = _ref.functionDeclarations;
    var functionDeclarations = _ref$functionDeclarat === undefined ? new _multimap2.default() : _ref$functionDeclarat;
    var _ref$children = _ref.children;
    var // function declarations are special: they are lexical in blocks and var-scoped at the top level of functions and scripts.
    children = _ref$children === undefined ? [] : _ref$children;
    var _ref$dynamic = _ref.dynamic;
    var dynamic = _ref$dynamic === undefined ? false : _ref$dynamic;
    var _ref$bindingsForParen = _ref.bindingsForParent;
    var bindingsForParent = _ref$bindingsForParen === undefined ? [] : _ref$bindingsForParen;
    var _ref$potentiallyVarSc = _ref.potentiallyVarScopedFunctionDeclarations;
    var //  either references bubbling up to the AssignmentExpression, ForOfStatement, or ForInStatement which writes to them or declarations bubbling up to the VariableDeclaration, FunctionDeclaration, ClassDeclaration, FormalParameters, Setter, Method, or CatchClause which declares them
    potentiallyVarScopedFunctionDeclarations = _ref$potentiallyVarSc === undefined ? new _multimap2.default() : _ref$potentiallyVarSc;
    var _ref$hasParameterExpr = _ref.hasParameterExpressions;
    var // for B.3.3.
    hasParameterExpressions = _ref$hasParameterExpr === undefined ? false : _ref$hasParameterExpr;

    _classCallCheck(this, ScopeState);

    this.freeIdentifiers = freeIdentifiers;
    this.functionScopedDeclarations = functionScopedDeclarations;
    this.blockScopedDeclarations = blockScopedDeclarations;
    this.functionDeclarations = functionDeclarations;
    this.children = children;
    this.dynamic = dynamic;
    this.bindingsForParent = bindingsForParent;
    this.potentiallyVarScopedFunctionDeclarations = potentiallyVarScopedFunctionDeclarations;
    this.hasParameterExpressions = hasParameterExpressions;
  }

  _createClass(ScopeState, [{
    key: "concat",

    /*
     * Monoidal append: merges the two states together
     */
    value: function concat(b) {
      if (this === b) {
        return this;
      }
      return new ScopeState({
        freeIdentifiers: merge(merge(new _multimap2.default(), this.freeIdentifiers), b.freeIdentifiers),
        functionScopedDeclarations: merge(merge(new _multimap2.default(), this.functionScopedDeclarations), b.functionScopedDeclarations),
        blockScopedDeclarations: merge(merge(new _multimap2.default(), this.blockScopedDeclarations), b.blockScopedDeclarations),
        functionDeclarations: merge(merge(new _multimap2.default(), this.functionDeclarations), b.functionDeclarations),
        children: this.children.concat(b.children),
        dynamic: this.dynamic || b.dynamic,
        bindingsForParent: this.bindingsForParent.concat(b.bindingsForParent),
        potentiallyVarScopedFunctionDeclarations: merge(merge(new _multimap2.default(), this.potentiallyVarScopedFunctionDeclarations), b.potentiallyVarScopedFunctionDeclarations),
        hasParameterExpressions: this.hasParameterExpressions || b.hasParameterExpressions
      });
    }

    /*
     * Observe variables entering scope
     */

  }, {
    key: "addDeclarations",
    value: function addDeclarations(kind) {
      var keepBindingsForParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var declMap = new _multimap2.default();
      merge(declMap, kind.isBlockScoped ? this.blockScopedDeclarations : this.functionScopedDeclarations);
      this.bindingsForParent.forEach(function (binding) {
        return declMap.set(binding.name, new _declaration.Declaration(binding, kind));
      });
      var s = new ScopeState(this);
      if (kind.isBlockScoped) {
        s.blockScopedDeclarations = declMap;
      } else {
        s.functionScopedDeclarations = declMap;
      }
      if (!keepBindingsForParent) {
        s.bindingsForParent = [];
      }
      return s;
    }
  }, {
    key: "addFunctionDeclaration",
    value: function addFunctionDeclaration() {
      var binding = bindingsForParent[0]; // should be the only item.
      var s = new ScopeState(this);
      s.functionDeclarations = new _multimap2.default([[binding.name, new _declaration.Declaration(binding, DeclarationType.FUNCTION_DECLARATION)]]);
      s.bindingsForParent = [];
      return s;
    }

    /*
     * Observe a reference to a variable
     */

  }, {
    key: "addReferences",
    value: function addReferences(accessibility) {
      var keepBindingsForParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var freeMap = new _multimap2.default();
      merge(freeMap, this.freeIdentifiers);
      this.bindingsForParent.forEach(function (binding) {
        return freeMap.set(binding.name, new _reference.Reference(binding, accessibility));
      });
      var s = new ScopeState(this);
      s.freeIdentifiers = freeMap;
      if (!keepBindingsForParent) {
        s.bindingsForParent = [];
      }
      return s;
    }
  }, {
    key: "taint",
    value: function taint() {
      var s = new ScopeState(this);
      s.dynamic = true;
      return s;
    }
  }, {
    key: "withoutBindingsForParent",
    value: function withoutBindingsForParent() {
      var s = new ScopeState(this);
      s.bindingsForParent = [];
      return s;
    }
  }, {
    key: "withParameterExpression",
    value: function withParameterExpression() {
      var s = new ScopeState(this);
      s.hasParameterExpressions = true;
      return s;
    }
  }, {
    key: "withoutParameterExpression",
    value: function withoutParameterExpression() {
      var s = new ScopeState(this);
      s.hasParameterExpressions = false;
      return s;
    }
  }, {
    key: "withPotentialVarFunctions",
    value: function withPotentialVarFunctions(functions) {
      var pvsfd = merge(new _multimap2.default(), this.potentiallyVarScopedFunctionDeclarations);
      functions.forEach(function (f) {
        return pvsfd.put(f.name, f);
      });
      var s = new ScopeState(this);
      s.potentiallyVarScopedFunctionDeclarations = pvsfd;
      return s;
    }

    /*
     * Used when a scope boundary is encountered. Resolves found free identifiers
     * and declarations into variable objects. Any free identifiers remaining are
     * carried forward into the new state object.
     */

  }, {
    key: "finish",
    value: function finish(astNode, scopeType) {
      var shouldResolveArguments = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      // todo
      var variables = [];
      var functionScoped = new _multimap2.default();
      var freeIdentifiers = merge(new _multimap2.default(), this.freeIdentifiers);
      var pvsfd = merge(new _multimap2.default(), this.potentiallyVarScopedFunctionDeclarations);
      var children = this.children;

      this.blockScopedDeclarations.forEachEntry(function (v, k) {
        pvsfd.delete(k);
      });
      this.functionDeclarations.forEachEntry(function (v, k) {
        var existing = pvsfd.get(k);
        if (existing && (v.length > 1 || v[0].node !== existing)) {
          pvsfd.delete(k);
        }
      });

      switch (scopeType) {
        case _scope.ScopeType.BLOCK:
        case _scope.ScopeType.CATCH:
        case _scope.ScopeType.WITH:
        case _scope.ScopeType.FUNCTION_NAME:
        case _scope.ScopeType.PARAMETERS:
        case _scope.ScopeType.PARAMETER_EXPRESSION:
          // resolve references to only block-scoped free declarations
          variables = resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, variables);
          merge(functionScoped, this.functionScopedDeclarations);
          break;
        case _scope.ScopeType.ARROW_FUNCTION:
        case _scope.ScopeType.FUNCTION:
        case _scope.ScopeType.MODULE:
        case _scope.ScopeType.SCRIPT:
          // resolve references to both block-scoped and function-scoped free declarations

          // todo maybe reorganize this section for readability

          var declarations = new _multimap2.default();
          if (scopeType === _scope.ScopeType.SCRIPT) {
            // top-level lexical declarations in scripts are not globals, so create a separate scope for them
            children = [new _scope.Scope(children, resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, []), freeIdentifiers, _scope.ScopeType.SCRIPT, this.dynamic, astNode)];
          } else {
            merge(declarations, this.blockScopedDeclarations);
          }

          if (shouldResolveArguments) {
            declarations.set('arguments');
          }
          merge(declarations, this.functionScopedDeclarations);

          // B.3.3
          if (scopeType === _scope.ScopeType.ARROW_FUNCTION || scopeType === _scope.ScopeType.FUNCTION) {
            // maybe also scripts? spec currently doesn't say to, but that may be a bug.
            merge(declarations, pvsfd);
          }
          pvsfd = new _multimap2.default();

          variables = resolveDeclarations(freeIdentifiers, declarations, variables);

          // no declarations in a module are global
          if (scopeType === _scope.ScopeType.MODULE) {
            children = [new _scope.Scope(children, variables, freeIdentifiers, _scope.ScopeType.MODULE, this.dynamic, astNode)];
            variables = [];
          }
          break;
        default:
          throw new Error("not reached");
      }

      var scope = scopeType === _scope.ScopeType.SCRIPT || scopeType === _scope.ScopeType.MODULE ? new _scope.GlobalScope(children, variables, freeIdentifiers, astNode) : new _scope.Scope(children, variables, freeIdentifiers, scopeType, this.dynamic, astNode);

      return new ScopeState({
        freeIdentifiers: freeIdentifiers,
        functionScopedDeclarations: functionScoped,
        children: [scope],
        bindingsForParent: this.bindingsForParent,
        potentiallyVarScopedFunctionDeclarations: pvsfd
      });
    }
  }], [{
    key: "empty",
    value: function empty() {
      return new ScopeState({});
    }
  }]);

  return ScopeState;
})();

exports.default = ScopeState;