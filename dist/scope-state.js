"use strict";

var _bind = Function.prototype.bind;

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

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

var MultiMap = require("multimap");

function merge(multiMap, otherMultiMap) {
  otherMultiMap.forEachEntry(function (v, k) {
    multiMap.set.apply(multiMap, [k].concat(v));
  });
  return multiMap;
}

var _scope = require("./scope");

var Scope = _scope.Scope;
var GlobalScope = _scope.GlobalScope;
var ScopeType = _scope.ScopeType;

var Variable = require("./variable")["default"];

function resolveArguments(freeIdentifiers, variables) {
  // todo
  var args = freeIdentifiers.get("arguments") || [];
  freeIdentifiers["delete"]("arguments");
  return variables.concat(new Variable("arguments", args, []));
}

function resolveDeclarations(freeIdentifiers, decls, variables) {
  // todo
  decls.forEachEntry(function (declarations, name) {
    var references = freeIdentifiers.get(name) || [];
    variables = variables.concat(new Variable(name, references, declarations));
    freeIdentifiers["delete"](name);
  });
  return variables; // todo just modify variables in place?
}

var ScopeState = (function () {
  function ScopeState(_ref) {
    var _ref$freeIdentifiers = _ref.freeIdentifiers;
    var freeIdentifiers = _ref$freeIdentifiers === undefined ? new MultiMap() : _ref$freeIdentifiers;
    var _ref$functionScopedDeclarations = _ref.functionScopedDeclarations;
    var functionScopedDeclarations = _ref$functionScopedDeclarations === undefined ? new MultiMap() : _ref$functionScopedDeclarations;
    var _ref$blockScopedDeclarations = _ref.blockScopedDeclarations;
    var blockScopedDeclarations = _ref$blockScopedDeclarations === undefined ? new MultiMap() : _ref$blockScopedDeclarations;
    var _ref$functionDeclarations = _ref.functionDeclarations;
    var functionDeclarations = _ref$functionDeclarations === undefined ? new MultiMap() : _ref$functionDeclarations;
    var _ref$children = _ref.children;
    var children = _ref$children === undefined ? [] : _ref$children;
    var _ref$dynamic = _ref.dynamic;
    var dynamic = _ref$dynamic === undefined ? false : _ref$dynamic;
    var _ref$bindingsForParent = _ref.bindingsForParent;
    var bindingsForParent = _ref$bindingsForParent === undefined ? [] : _ref$bindingsForParent;
    var _ref$potentiallyVarScopedFunctionDeclarations = _ref.potentiallyVarScopedFunctionDeclarations;
    var potentiallyVarScopedFunctionDeclarations = _ref$potentiallyVarScopedFunctionDeclarations === undefined ? new Map() : _ref$potentiallyVarScopedFunctionDeclarations;
    var _ref$hasParameterExpressions = _ref.hasParameterExpressions;
    var hasParameterExpressions = _ref$hasParameterExpressions === undefined ? false : _ref$hasParameterExpressions;

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

  _createClass(ScopeState, {
    concat: {

      /*
       * Monoidal append: merges the two states together
       */

      value: function concat(b) {
        if (this === b) {
          return this;
        }
        var pvsfd = new Map([].concat(_toConsumableArray(this.potentiallyVarScopedFunctionDeclarations), _toConsumableArray(b.potentiallyVarScopedFunctionDeclarations)));
        this.potentiallyVarScopedFunctionDeclarations.forEach(function (v, k) {
          if (b.potentiallyVarScopedFunctionDeclarations.has(k)) {
            pvsfd.set(k, null);
          }
        });
        return new ScopeState({
          freeIdentifiers: merge(merge(new MultiMap(), this.freeIdentifiers), b.freeIdentifiers),
          functionScopedDeclarations: merge(merge(new MultiMap(), this.functionScopedDeclarations), b.functionScopedDeclarations),
          blockScopedDeclarations: merge(merge(new MultiMap(), this.blockScopedDeclarations), b.blockScopedDeclarations),
          functionDeclarations: merge(merge(new MultiMap(), this.functionDeclarations), b.functionDeclarations),
          children: this.children.concat(b.children),
          dynamic: this.dynamic || b.dynamic,
          potentiallyVarScopedFunctionDeclarations: pvsfd,
          hasParameterExpressions: this.hasParameterExpressions || b.hasParameterExpressions });
      }
    },
    addDeclarations: {

      /*
       * Observe variables entering scope
       */

      value: function addDeclarations(kind) {
        var keepBindingsForParent = arguments[1] === undefined ? false : arguments[1];

        var declMap = new MultiMap();
        merge(declMap, kind.isBlockScoped ? this.blockScopedDeclarations : this.functionScopedDeclarations);
        this.bindingsForParent.forEach(function (binding) {
          return declMap.set(binding.name, new Declaration(binding, kind));
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
    },
    addFunctionDeclaration: {
      value: function addFunctionDeclaration() {
        var binding = bindingsForParent[0]; // should be the only item.
        var s = new ScopeState(this);
        s.functionDeclarations = new MultiMap([[binding.name, new Declaration(binding, DeclarationType.FUNCTION_DECLARATION)]]);
        s.bindingsForParent = [];
        return s;
      }
    },
    addReferences: {

      /*
       * Observe a reference to a variable
       */

      value: function addReferences(accessibility) {
        var keepBindingsForParent = arguments[1] === undefined ? false : arguments[1];

        var freeMap = new MultiMap();
        merge(freeMap, this.freeIdentifiers);
        this.bindingsForParent.forEach(function (binding) {
          return freeMap.set(binding.name, new Reference(binding, accessibility));
        });
        var s = new ScopeState(this);
        s.freeIdentifiers = freeMap;
        if (!keepBindingsForParent) {
          s.bindingsForParent = [];
        }
        return s;
      }
    },
    taint: {
      value: function taint() {
        var s = new ScopeState(this);
        s.dynamic = true;
        return s;
      }
    },
    withoutBindingsForParent: {
      value: function withoutBindingsForParent() {
        var s = new ScopeState(this);
        s.bindingsForParent = [];
        return s;
      }
    },
    withParameterExpression: {
      value: function withParameterExpression() {
        var s = new ScopeState(this);
        s.hasParameterExpressions = true;
        return s;
      }
    },
    withoutParameterExpression: {
      value: function withoutParameterExpression() {
        var s = new ScopeState(this);
        s.hasParameterExpressions = false;
        return s;
      }
    },
    withPotentialVarFunctions: {
      value: function withPotentialVarFunctions(functions) {
        var pvsfd = new Map(this.potentiallyVarScopedFunctionDeclarations);
        functions.forEach(function (f) {
          return pvsfd.put(f.name, pvsfd.has(f.name) ? null : f);
        });
        var s = new ScopeState(this);
        s.potentiallyVarScopedFunctionDeclarations = pvsfd;
        return s;
      }
    },
    finish: {

      /*
       * Used when a scope boundary is encountered. Resolves found free identifiers
       * and declarations into variable objects. Any free identifiers remaining are
       * carried forward into the new state object.
       */

      value: function finish(astNode, scopeType) {
        var shouldResolveArguments = arguments[2] === undefined ? false : arguments[2];
        // todo
        var variables = [];
        var functionScoped = new MultiMap();
        var freeIdentifiers = new MultiMap();
        var pvsfd = new Map(this.potentiallyVarScopedFunctionDeclarations);
        var children = this.children;

        merge(freeIdentifiers, this.freeIdentifiers);

        this.blockScopedDeclarations.forEachEntry(function (v, k) {
          pvsfd["delete"](k);
        });
        this.functionDeclarations.forEachEntry(function (v, k) {
          var existing = pvsfd.get(k);
          if (existing && (v.length > 1 || v[0].node !== existing)) {
            pvsfd["delete"](k);
          }
        });
        pvsfd = new Map(new (_bind.apply(Array, [null].concat(_toConsumableArray(pvsfd))))().filter(function (p) {
          return p[1] !== null;
        }));

        switch (scopeType) {
          case ScopeType.BLOCK:
          case ScopeType.CATCH:
          case ScopeType.WITH:
          case ScopeType.FUNCTION_NAME:
          case ScopeType.PARAMETERS:
          case ScopeType.PARAMETER_EXPRESSION:
            // resolve references to only block-scoped free declarations
            variables = resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, variables);
            merge(functionScoped, this.functionScopedDeclarations);
            break;
          case ScopeType.ARROW_FUNCTION:
          case ScopeType.FUNCTION:
          case ScopeType.MODULE:
          case ScopeType.SCRIPT:
            // resolve references to both block-scoped and function-scoped free declarations

            // todo maybe reorganize this section for readability

            variables = resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, variables);

            if (scopeType === ScopeType.SCRIPT) {
              // top-level lexical declarations in scripts are not globals, so create a separate scope for them
              children = [new Scope(children, variables, freeIdentifiers, ScopeType.SCRIPT, this.dynamic, astNode)];
              variables = [];
            }

            if (shouldResolveArguments) {
              variables = resolveArguments(freeIdentifiers, variables);
            }
            variables = resolveDeclarations(freeIdentifiers, this.functionScopedDeclarations, variables);

            // B.3.3
            if (scopeType === ScopeType.ARROW_FUNCTION || scopeType === ScopeType.FUNCTION) {
              // maybe also scripts? spec currently doesn't say to, but that may be a bug.
              variables = resolveDeclarations(freeIdentifiers, new MultiMap(pvsfd), variables);
            }
            pvsfd = new Map();

            // no declarations in a module are global
            if (scopeType === ScopeType.MODULE) {
              children = [new Scope(children, variables, freeIdentifiers, ScopeType.MODULE, this.dynamic, astNode)];
              variables = [];
            }
            break;
          default:
            throw new Error("not reached");
        }

        var scope = scopeType === ScopeType.GLOBAL ? new GlobalScope(children, variables, freeIdentifiers, astNode) : new Scope(children, variables, freeIdentifiers, scopeType, this.dynamic, astNode);

        return new ScopeState({
          freeIdentifiers: freeIdentifiers,
          functionScopedDeclarations: functionScoped,
          children: [scope],
          bindingsForParent: this.bindingsForParent,
          potentiallyVarScopedFunctionDeclarations: pvsfd
        });
      }
    }
  }, {
    empty: {
      value: function empty() {
        return new ScopeState({});
      }
    }
  });

  return ScopeState;
})();

exports["default"] = ScopeState;
// function declarations are special: they are lexical in blocks and var-scoped at the top level of functions and scripts.
//  either references bubbling up to the AssignmentExpression, ForOfStatement, or ForInStatement which writes to them or declarations bubbling up to the VariableDeclaration, FunctionDeclaration, ClassDeclaration, FormalParameters, Setter, Method, or CatchClause which declares them
// for B.3.3. Maps from names of functions. Either goes to the relevant BindingIdentifier, or to null if no function declaration of that name can be var-scoped in the current context.
//# sourceMappingURL=data:application/json;base64,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SyxHQUFHLElBQUksR0FBRyxFQUFBLENBQUM7OztBQUdoQixnQkFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUNsQyxzQkFBUSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdEcsdUJBQVMsR0FBRyxFQUFFLENBQUM7YUFDaEI7QUFDRCxrQkFBTTtBQUFBLEFBQ1I7QUFDRSxrQkFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUFBLFNBQ2hDOztBQUVELFlBQU0sS0FBSyxHQUFHLFNBQVMsS0FBSyxTQUFTLENBQUMsTUFBTSxHQUN4QyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FDOUQsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXRGLGVBQU8sSUFBSSxVQUFVLENBQUM7QUFDcEIseUJBQWUsRUFBRSxlQUFlO0FBQ2hDLG9DQUEwQixFQUFFLGNBQWM7QUFDMUMsa0JBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNqQiwyQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO0FBQ3pDLGtEQUF3QyxFQUFFLEtBQUs7U0FDaEQsQ0FBQyxDQUFDO09BQ0o7OztBQTdMTSxTQUFLO2FBQUEsaUJBQUc7QUFDYixlQUFPLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQzNCOzs7O1NBekJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJzcmMvc2NvcGUtc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE0IFNoYXBlIFNlY3VyaXR5LCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgTWFwIGZyb20gXCJlczYtbWFwXCI7XG5pbXBvcnQgKiBhcyBNdWx0aU1hcCBmcm9tIFwibXVsdGltYXBcIjtcblxuZnVuY3Rpb24gbWVyZ2UobXVsdGlNYXAsIG90aGVyTXVsdGlNYXApIHtcbiAgb3RoZXJNdWx0aU1hcC5mb3JFYWNoRW50cnkoKHYsIGspID0+IHtcbiAgICBtdWx0aU1hcC5zZXQuYXBwbHkobXVsdGlNYXAsIFtrXS5jb25jYXQodikpO1xuICB9KTtcbiAgcmV0dXJuIG11bHRpTWFwO1xufVxuXG5pbXBvcnQge1Njb3BlLCBHbG9iYWxTY29wZSwgU2NvcGVUeXBlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IFZhcmlhYmxlIGZyb20gXCIuL3ZhcmlhYmxlXCI7XG5cbmZ1bmN0aW9uIHJlc29sdmVBcmd1bWVudHMoZnJlZUlkZW50aWZpZXJzLCB2YXJpYWJsZXMpIHsgLy8gdG9kb1xuICBsZXQgYXJncyA9IGZyZWVJZGVudGlmaWVycy5nZXQoXCJhcmd1bWVudHNcIikgfHwgW107XG4gIGZyZWVJZGVudGlmaWVycy5kZWxldGUoXCJhcmd1bWVudHNcIik7XG4gIHJldHVybiB2YXJpYWJsZXMuY29uY2F0KG5ldyBWYXJpYWJsZShcImFyZ3VtZW50c1wiLCBhcmdzLCBbXSkpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRGVjbGFyYXRpb25zKGZyZWVJZGVudGlmaWVycywgZGVjbHMsIHZhcmlhYmxlcykgeyAvLyB0b2RvXG4gIGRlY2xzLmZvckVhY2hFbnRyeSgoZGVjbGFyYXRpb25zLCBuYW1lKSA9PiB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSBmcmVlSWRlbnRpZmllcnMuZ2V0KG5hbWUpIHx8IFtdO1xuICAgIHZhcmlhYmxlcyA9IHZhcmlhYmxlcy5jb25jYXQobmV3IFZhcmlhYmxlKG5hbWUsIHJlZmVyZW5jZXMsIGRlY2xhcmF0aW9ucykpO1xuICAgIGZyZWVJZGVudGlmaWVycy5kZWxldGUobmFtZSk7XG4gIH0pO1xuICByZXR1cm4gdmFyaWFibGVzOyAgLy8gdG9kbyBqdXN0IG1vZGlmeSB2YXJpYWJsZXMgaW4gcGxhY2U/XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlU3RhdGUge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJlZUlkZW50aWZpZXJzID0gbmV3IE11bHRpTWFwLFxuICAgIGZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zID0gbmV3IE11bHRpTWFwLFxuICAgIGJsb2NrU2NvcGVkRGVjbGFyYXRpb25zID0gbmV3IE11bHRpTWFwLFxuICAgIGZ1bmN0aW9uRGVjbGFyYXRpb25zID0gbmV3IE11bHRpTWFwLCAvLyBmdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIHNwZWNpYWw6IHRoZXkgYXJlIGxleGljYWwgaW4gYmxvY2tzIGFuZCB2YXItc2NvcGVkIGF0IHRoZSB0b3AgbGV2ZWwgb2YgZnVuY3Rpb25zIGFuZCBzY3JpcHRzLlxuICAgIGNoaWxkcmVuID0gW10sXG4gICAgZHluYW1pYyA9IGZhbHNlLFxuICAgIGJpbmRpbmdzRm9yUGFyZW50ID0gW10sIC8vICBlaXRoZXIgcmVmZXJlbmNlcyBidWJibGluZyB1cCB0byB0aGUgQXNzaWdubWVudEV4cHJlc3Npb24sIEZvck9mU3RhdGVtZW50LCBvciBGb3JJblN0YXRlbWVudCB3aGljaCB3cml0ZXMgdG8gdGhlbSBvciBkZWNsYXJhdGlvbnMgYnViYmxpbmcgdXAgdG8gdGhlIFZhcmlhYmxlRGVjbGFyYXRpb24sIEZ1bmN0aW9uRGVjbGFyYXRpb24sIENsYXNzRGVjbGFyYXRpb24sIEZvcm1hbFBhcmFtZXRlcnMsIFNldHRlciwgTWV0aG9kLCBvciBDYXRjaENsYXVzZSB3aGljaCBkZWNsYXJlcyB0aGVtXG4gICAgcG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9ucyA9IG5ldyBNYXAsIC8vIGZvciBCLjMuMy4gTWFwcyBmcm9tIG5hbWVzIG9mIGZ1bmN0aW9ucy4gRWl0aGVyIGdvZXMgdG8gdGhlIHJlbGV2YW50IEJpbmRpbmdJZGVudGlmaWVyLCBvciB0byBudWxsIGlmIG5vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIG9mIHRoYXQgbmFtZSBjYW4gYmUgdmFyLXNjb3BlZCBpbiB0aGUgY3VycmVudCBjb250ZXh0LlxuICAgIGhhc1BhcmFtZXRlckV4cHJlc3Npb25zID0gZmFsc2UsXG4gIH0pIHtcbiAgICB0aGlzLmZyZWVJZGVudGlmaWVycyA9IGZyZWVJZGVudGlmaWVycztcbiAgICB0aGlzLmZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zID0gZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnM7XG4gICAgdGhpcy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucyA9IGJsb2NrU2NvcGVkRGVjbGFyYXRpb25zO1xuICAgIHRoaXMuZnVuY3Rpb25EZWNsYXJhdGlvbnMgPSBmdW5jdGlvbkRlY2xhcmF0aW9ucztcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgdGhpcy5keW5hbWljID0gZHluYW1pYztcbiAgICB0aGlzLmJpbmRpbmdzRm9yUGFyZW50ID0gYmluZGluZ3NGb3JQYXJlbnQ7XG4gICAgdGhpcy5wb3RlbnRpYWxseVZhclNjb3BlZEZ1bmN0aW9uRGVjbGFyYXRpb25zID0gcG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9ucztcbiAgICB0aGlzLmhhc1BhcmFtZXRlckV4cHJlc3Npb25zID0gaGFzUGFyYW1ldGVyRXhwcmVzc2lvbnM7XG4gIH1cblxuICBzdGF0aWMgZW1wdHkoKSB7XG4gICAgcmV0dXJuIG5ldyBTY29wZVN0YXRlKHt9KTtcbiAgfVxuXG4gIC8qXG4gICAqIE1vbm9pZGFsIGFwcGVuZDogbWVyZ2VzIHRoZSB0d28gc3RhdGVzIHRvZ2V0aGVyXG4gICAqL1xuICBjb25jYXQoYikge1xuICAgIGlmICh0aGlzID09PSBiKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgbGV0IHB2c2ZkID0gbmV3IE1hcChbXG4gICAgICAuLi50aGlzLnBvdGVudGlhbGx5VmFyU2NvcGVkRnVuY3Rpb25EZWNsYXJhdGlvbnMsIC4uLmIucG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9uc1xuICAgIF0pO1xuICAgIHRoaXMucG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9ucy5mb3JFYWNoKFxuICAgICAgKHYsaykgPT4ge2lmIChiLnBvdGVudGlhbGx5VmFyU2NvcGVkRnVuY3Rpb25EZWNsYXJhdGlvbnMuaGFzKGspKSB7XG4gICAgICAgIHB2c2ZkLnNldChrLCBudWxsKTtcbiAgICAgIH19XG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFNjb3BlU3RhdGUoe1xuICAgICAgZnJlZUlkZW50aWZpZXJzOiBtZXJnZShtZXJnZShuZXcgTXVsdGlNYXAsIHRoaXMuZnJlZUlkZW50aWZpZXJzKSwgYi5mcmVlSWRlbnRpZmllcnMpLFxuICAgICAgZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnM6IG1lcmdlKG1lcmdlKG5ldyBNdWx0aU1hcCwgdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyksIGIuZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnMpLFxuICAgICAgYmxvY2tTY29wZWREZWNsYXJhdGlvbnM6IG1lcmdlKG1lcmdlKG5ldyBNdWx0aU1hcCwgdGhpcy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucyksIGIuYmxvY2tTY29wZWREZWNsYXJhdGlvbnMpLFxuICAgICAgZnVuY3Rpb25EZWNsYXJhdGlvbnM6IG1lcmdlKG1lcmdlKG5ldyBNdWx0aU1hcCwgdGhpcy5mdW5jdGlvbkRlY2xhcmF0aW9ucyksIGIuZnVuY3Rpb25EZWNsYXJhdGlvbnMpLFxuICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4uY29uY2F0KGIuY2hpbGRyZW4pLFxuICAgICAgZHluYW1pYzogdGhpcy5keW5hbWljIHx8IGIuZHluYW1pYyxcbiAgICAgIHBvdGVudGlhbGx5VmFyU2NvcGVkRnVuY3Rpb25EZWNsYXJhdGlvbnM6IHB2c2ZkLFxuICAgICAgaGFzUGFyYW1ldGVyRXhwcmVzc2lvbnM6IHRoaXMuaGFzUGFyYW1ldGVyRXhwcmVzc2lvbnMgfHwgYi5oYXNQYXJhbWV0ZXJFeHByZXNzaW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIE9ic2VydmUgdmFyaWFibGVzIGVudGVyaW5nIHNjb3BlXG4gICAqL1xuICBhZGREZWNsYXJhdGlvbnMoa2luZCwga2VlcEJpbmRpbmdzRm9yUGFyZW50ID0gZmFsc2UpIHtcbiAgICBsZXQgZGVjbE1hcCA9IG5ldyBNdWx0aU1hcDtcbiAgICBtZXJnZShkZWNsTWFwLCBraW5kLmlzQmxvY2tTY29wZWQgPyB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zIDogdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyk7XG4gICAgdGhpcy5iaW5kaW5nc0ZvclBhcmVudC5mb3JFYWNoKGJpbmRpbmcgPT4gZGVjbE1hcC5zZXQoYmluZGluZy5uYW1lLCBuZXcgRGVjbGFyYXRpb24oYmluZGluZywga2luZCkpKTtcbiAgICBsZXQgcyA9IG5ldyBTY29wZVN0YXRlKHRoaXMpO1xuICAgIGlmIChraW5kLmlzQmxvY2tTY29wZWQpIHtcbiAgICAgIHMuYmxvY2tTY29wZWREZWNsYXJhdGlvbnMgPSBkZWNsTWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICBzLmZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zID0gZGVjbE1hcDtcbiAgICB9XG4gICAgaWYgKCFrZWVwQmluZGluZ3NGb3JQYXJlbnQpIHtcbiAgICAgIHMuYmluZGluZ3NGb3JQYXJlbnQgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICBhZGRGdW5jdGlvbkRlY2xhcmF0aW9uKCkge1xuICAgIGNvbnN0IGJpbmRpbmcgPSBiaW5kaW5nc0ZvclBhcmVudFswXTsgLy8gc2hvdWxkIGJlIHRoZSBvbmx5IGl0ZW0uXG4gICAgbGV0IHMgPSBuZXcgU2NvcGVTdGF0ZSh0aGlzKTtcbiAgICBzLmZ1bmN0aW9uRGVjbGFyYXRpb25zID0gbmV3IE11bHRpTWFwKFtbYmluZGluZy5uYW1lLCBuZXcgRGVjbGFyYXRpb24oYmluZGluZywgRGVjbGFyYXRpb25UeXBlLkZVTkNUSU9OX0RFQ0xBUkFUSU9OKV1dKTtcbiAgICBzLmJpbmRpbmdzRm9yUGFyZW50ID0gW107XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICAvKlxuICAgKiBPYnNlcnZlIGEgcmVmZXJlbmNlIHRvIGEgdmFyaWFibGVcbiAgICovXG4gIGFkZFJlZmVyZW5jZXMoYWNjZXNzaWJpbGl0eSwga2VlcEJpbmRpbmdzRm9yUGFyZW50ID0gZmFsc2UpIHtcbiAgICBsZXQgZnJlZU1hcCA9IG5ldyBNdWx0aU1hcDtcbiAgICBtZXJnZShmcmVlTWFwLCB0aGlzLmZyZWVJZGVudGlmaWVycyk7XG4gICAgdGhpcy5iaW5kaW5nc0ZvclBhcmVudC5mb3JFYWNoKGJpbmRpbmcgPT4gZnJlZU1hcC5zZXQoYmluZGluZy5uYW1lLCBuZXcgUmVmZXJlbmNlKGJpbmRpbmcsIGFjY2Vzc2liaWxpdHkpKSk7XG4gICAgbGV0IHMgPSBuZXcgU2NvcGVTdGF0ZSh0aGlzKTtcbiAgICBzLmZyZWVJZGVudGlmaWVycyA9IGZyZWVNYXA7XG4gICAgaWYgKCFrZWVwQmluZGluZ3NGb3JQYXJlbnQpIHtcbiAgICAgIHMuYmluZGluZ3NGb3JQYXJlbnQgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICB0YWludCgpIHtcbiAgICBsZXQgcyA9IG5ldyBTY29wZVN0YXRlKHRoaXMpO1xuICAgIHMuZHluYW1pYyA9IHRydWU7XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICB3aXRob3V0QmluZGluZ3NGb3JQYXJlbnQoKSB7XG4gICAgbGV0IHMgPSBuZXcgU2NvcGVTdGF0ZSh0aGlzKTtcbiAgICBzLmJpbmRpbmdzRm9yUGFyZW50ID0gW107XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICB3aXRoUGFyYW1ldGVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgcyA9IG5ldyBTY29wZVN0YXRlKHRoaXMpO1xuICAgIHMuaGFzUGFyYW1ldGVyRXhwcmVzc2lvbnMgPSB0cnVlO1xuICAgIHJldHVybiBzO1xuICB9XG5cbiAgd2l0aG91dFBhcmFtZXRlckV4cHJlc3Npb24oKSB7XG4gICAgbGV0IHMgPSBuZXcgU2NvcGVTdGF0ZSh0aGlzKTtcbiAgICBzLmhhc1BhcmFtZXRlckV4cHJlc3Npb25zID0gZmFsc2U7XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICB3aXRoUG90ZW50aWFsVmFyRnVuY3Rpb25zKGZ1bmN0aW9ucykge1xuICAgIGxldCBwdnNmZCA9IG5ldyBNYXAodGhpcy5wb3RlbnRpYWxseVZhclNjb3BlZEZ1bmN0aW9uRGVjbGFyYXRpb25zKTtcbiAgICBmdW5jdGlvbnMuZm9yRWFjaChmID0+IHB2c2ZkLnB1dChmLm5hbWUsIHB2c2ZkLmhhcyhmLm5hbWUpID8gbnVsbCA6IGYpKTtcbiAgICBsZXQgcyA9IG5ldyBTY29wZVN0YXRlKHRoaXMpO1xuICAgIHMucG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9ucyA9IHB2c2ZkO1xuICAgIHJldHVybiBzO1xuICB9XG5cbiAgLypcbiAgICogVXNlZCB3aGVuIGEgc2NvcGUgYm91bmRhcnkgaXMgZW5jb3VudGVyZWQuIFJlc29sdmVzIGZvdW5kIGZyZWUgaWRlbnRpZmllcnNcbiAgICogYW5kIGRlY2xhcmF0aW9ucyBpbnRvIHZhcmlhYmxlIG9iamVjdHMuIEFueSBmcmVlIGlkZW50aWZpZXJzIHJlbWFpbmluZyBhcmVcbiAgICogY2FycmllZCBmb3J3YXJkIGludG8gdGhlIG5ldyBzdGF0ZSBvYmplY3QuXG4gICAqL1xuICBmaW5pc2goYXN0Tm9kZSwgc2NvcGVUeXBlLCBzaG91bGRSZXNvbHZlQXJndW1lbnRzID0gZmFsc2UpIHsgLy8gdG9kb1xuICAgIGxldCB2YXJpYWJsZXMgPSBbXTtcbiAgICBsZXQgZnVuY3Rpb25TY29wZWQgPSBuZXcgTXVsdGlNYXA7XG4gICAgbGV0IGZyZWVJZGVudGlmaWVycyA9IG5ldyBNdWx0aU1hcDtcbiAgICBsZXQgcHZzZmQgPSBuZXcgTWFwKHRoaXMucG90ZW50aWFsbHlWYXJTY29wZWRGdW5jdGlvbkRlY2xhcmF0aW9ucyk7XG4gICAgbGV0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblxuICAgIG1lcmdlKGZyZWVJZGVudGlmaWVycywgdGhpcy5mcmVlSWRlbnRpZmllcnMpO1xuXG4gICAgdGhpcy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucy5mb3JFYWNoRW50cnkoKHYsIGspID0+IHtcbiAgICAgIHB2c2ZkLmRlbGV0ZShrKTtcbiAgICB9KTtcbiAgICB0aGlzLmZ1bmN0aW9uRGVjbGFyYXRpb25zLmZvckVhY2hFbnRyeSgodiwgaykgPT4ge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBwdnNmZC5nZXQoayk7XG4gICAgICBpZiAoZXhpc3RpbmcgJiYgKHYubGVuZ3RoID4gMSB8fCB2WzBdLm5vZGUgIT09IGV4aXN0aW5nKSkge1xuICAgICAgICBwdnNmZC5kZWxldGUoayk7XG4gICAgICB9XG4gICAgfSlcbiAgICBwdnNmZCA9IG5ldyBNYXAoKG5ldyBBcnJheSguLi5wdnNmZCkpLmZpbHRlcihwID0+IHBbMV0gIT09IG51bGwpKTtcblxuICAgIHN3aXRjaCAoc2NvcGVUeXBlKSB7XG4gICAgY2FzZSBTY29wZVR5cGUuQkxPQ0s6XG4gICAgY2FzZSBTY29wZVR5cGUuQ0FUQ0g6XG4gICAgY2FzZSBTY29wZVR5cGUuV0lUSDpcbiAgICBjYXNlIFNjb3BlVHlwZS5GVU5DVElPTl9OQU1FOlxuICAgIGNhc2UgU2NvcGVUeXBlLlBBUkFNRVRFUlM6XG4gICAgY2FzZSBTY29wZVR5cGUuUEFSQU1FVEVSX0VYUFJFU1NJT046XG4gICAgICAvLyByZXNvbHZlIHJlZmVyZW5jZXMgdG8gb25seSBibG9jay1zY29wZWQgZnJlZSBkZWNsYXJhdGlvbnNcbiAgICAgIHZhcmlhYmxlcyA9IHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLCB2YXJpYWJsZXMpO1xuICAgICAgbWVyZ2UoZnVuY3Rpb25TY29wZWQsIHRoaXMuZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTY29wZVR5cGUuQVJST1dfRlVOQ1RJT046XG4gICAgY2FzZSBTY29wZVR5cGUuRlVOQ1RJT046XG4gICAgY2FzZSBTY29wZVR5cGUuTU9EVUxFOlxuICAgIGNhc2UgU2NvcGVUeXBlLlNDUklQVDpcbiAgICAgIC8vIHJlc29sdmUgcmVmZXJlbmNlcyB0byBib3RoIGJsb2NrLXNjb3BlZCBhbmQgZnVuY3Rpb24tc2NvcGVkIGZyZWUgZGVjbGFyYXRpb25zXG5cbiAgICAgIC8vIHRvZG8gbWF5YmUgcmVvcmdhbml6ZSB0aGlzIHNlY3Rpb24gZm9yIHJlYWRhYmlsaXR5XG5cbiAgICAgIHZhcmlhYmxlcyA9IHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLCB2YXJpYWJsZXMpO1xuICAgICAgXG4gICAgICBpZiAoc2NvcGVUeXBlID09PSBTY29wZVR5cGUuU0NSSVBUKSB7XG4gICAgICAgIC8vIHRvcC1sZXZlbCBsZXhpY2FsIGRlY2xhcmF0aW9ucyBpbiBzY3JpcHRzIGFyZSBub3QgZ2xvYmFscywgc28gY3JlYXRlIGEgc2VwYXJhdGUgc2NvcGUgZm9yIHRoZW0gXG4gICAgICAgIGNoaWxkcmVuID0gW25ldyBTY29wZShjaGlsZHJlbiwgdmFyaWFibGVzLCBmcmVlSWRlbnRpZmllcnMsIFNjb3BlVHlwZS5TQ1JJUFQsIHRoaXMuZHluYW1pYywgYXN0Tm9kZSldO1xuICAgICAgICB2YXJpYWJsZXMgPSBbXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHNob3VsZFJlc29sdmVBcmd1bWVudHMpIHtcbiAgICAgICAgdmFyaWFibGVzID0gcmVzb2x2ZUFyZ3VtZW50cyhmcmVlSWRlbnRpZmllcnMsIHZhcmlhYmxlcyk7XG4gICAgICB9XG4gICAgICB2YXJpYWJsZXMgPSByZXNvbHZlRGVjbGFyYXRpb25zKGZyZWVJZGVudGlmaWVycywgdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucywgdmFyaWFibGVzKTtcblxuICAgICAgLy8gQi4zLjNcbiAgICAgIGlmIChzY29wZVR5cGUgPT09IFNjb3BlVHlwZS5BUlJPV19GVU5DVElPTiB8fCBzY29wZVR5cGUgPT09IFNjb3BlVHlwZS5GVU5DVElPTikgeyAvLyBtYXliZSBhbHNvIHNjcmlwdHM/IHNwZWMgY3VycmVudGx5IGRvZXNuJ3Qgc2F5IHRvLCBidXQgdGhhdCBtYXkgYmUgYSBidWcuXG4gICAgICAgIHZhcmlhYmxlcyA9IHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCBuZXcgTXVsdGlNYXAocHZzZmQpLCB2YXJpYWJsZXMpO1xuICAgICAgfVxuICAgICAgcHZzZmQgPSBuZXcgTWFwO1xuXG4gICAgICAvLyBubyBkZWNsYXJhdGlvbnMgaW4gYSBtb2R1bGUgYXJlIGdsb2JhbFxuICAgICAgaWYgKHNjb3BlVHlwZSA9PT0gU2NvcGVUeXBlLk1PRFVMRSkge1xuICAgICAgICBjaGlsZHJlbiA9IFtuZXcgU2NvcGUoY2hpbGRyZW4sIHZhcmlhYmxlcywgZnJlZUlkZW50aWZpZXJzLCBTY29wZVR5cGUuTU9EVUxFLCB0aGlzLmR5bmFtaWMsIGFzdE5vZGUpXTtcbiAgICAgICAgdmFyaWFibGVzID0gW107XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IHJlYWNoZWRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcGUgPSBzY29wZVR5cGUgPT09IFNjb3BlVHlwZS5HTE9CQUxcbiAgICAgID8gbmV3IEdsb2JhbFNjb3BlKGNoaWxkcmVuLCB2YXJpYWJsZXMsIGZyZWVJZGVudGlmaWVycywgYXN0Tm9kZSlcbiAgICAgIDogbmV3IFNjb3BlKGNoaWxkcmVuLCB2YXJpYWJsZXMsIGZyZWVJZGVudGlmaWVycywgc2NvcGVUeXBlLCB0aGlzLmR5bmFtaWMsIGFzdE5vZGUpO1xuXG4gICAgcmV0dXJuIG5ldyBTY29wZVN0YXRlKHtcbiAgICAgIGZyZWVJZGVudGlmaWVyczogZnJlZUlkZW50aWZpZXJzLFxuICAgICAgZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnM6IGZ1bmN0aW9uU2NvcGVkLFxuICAgICAgY2hpbGRyZW46IFtzY29wZV0sXG4gICAgICBiaW5kaW5nc0ZvclBhcmVudDogdGhpcy5iaW5kaW5nc0ZvclBhcmVudCxcbiAgICAgIHBvdGVudGlhbGx5VmFyU2NvcGVkRnVuY3Rpb25EZWNsYXJhdGlvbnM6IHB2c2ZkXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==