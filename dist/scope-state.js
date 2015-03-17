"use strict";

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
  var args = freeIdentifiers.get("arguments") || [];
  freeIdentifiers["delete"]("arguments");
  return variables.concat(new Variable("arguments", args, []));
}

function resolveDeclarations(freeIdentifiers, decls, variables) {
  decls.forEachEntry(function (declarations, name) {
    var references = freeIdentifiers.get(name) || [];
    variables = variables.concat(new Variable(name, references, declarations));
    freeIdentifiers["delete"](name);
  });
  return variables;
}

var ScopeState = (function () {
  function ScopeState(freeIdentifiers, functionScopedDeclarations, blockScopedDeclarations, children, dynamic) {
    _classCallCheck(this, ScopeState);

    this.freeIdentifiers = freeIdentifiers;
    this.functionScopedDeclarations = functionScopedDeclarations;
    this.blockScopedDeclarations = blockScopedDeclarations;
    this.children = children;
    this.dynamic = dynamic;
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
        return new ScopeState(merge(merge(new MultiMap(), this.freeIdentifiers), b.freeIdentifiers), merge(merge(new MultiMap(), this.functionScopedDeclarations), b.functionScopedDeclarations), merge(merge(new MultiMap(), this.blockScopedDeclarations), b.blockScopedDeclarations), this.children.concat(b.children), this.dynamic || b.dynamic);
      }
    },
    addDeclaration: {

      /*
       * Observe a variable entering scope
       */

      value: function addDeclaration(decl) {
        var declMap = new MultiMap();
        merge(declMap, decl.type.isBlockScoped ? this.blockScopedDeclarations : this.functionScopedDeclarations);
        declMap.set(decl.node.name, decl);
        return new ScopeState(this.freeIdentifiers, decl.type.isBlockScoped ? this.functionScopedDeclarations : declMap, decl.type.isBlockScoped ? declMap : this.blockScopedDeclarations, this.children, this.dynamic);
      }
    },
    addReference: {

      /*
       * Observe a reference to a variable
       */

      value: function addReference(ref) {
        var freeMap = new MultiMap();
        merge(freeMap, this.freeIdentifiers);
        freeMap.set(ref.node.name, ref);
        return new ScopeState(freeMap, this.functionScopedDeclarations, this.blockScopedDeclarations, this.children, this.dynamic);
      }
    },
    taint: {
      value: function taint() {
        return new ScopeState(this.freeIdentifiers, this.functionScopedDeclarations, this.blockScopedDeclarations, this.children, true);
      }
    },
    finish: {

      /*
       * Used when a scope boundary is encountered. Resolves found free identifiers
       * and declarations into variable objects. Any free identifiers remaining are
       * carried forward into the new state object.
       */

      value: function finish(astNode, scopeType) {
        var variables = [];
        var functionScope = new MultiMap();
        var freeIdentifiers = new MultiMap();

        merge(freeIdentifiers, this.freeIdentifiers);

        switch (scopeType) {
          case ScopeType.BLOCK:
          case ScopeType.CATCH:
          case ScopeType.WITH:
            // resolve references to only block-scoped free declarations
            variables = resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, variables);
            merge(functionScope, this.functionScopedDeclarations);
            break;
          default:
            // resolve references to both block-scoped and function-scoped free declarations
            if (scopeType === ScopeType.FUNCTION) {
              variables = resolveArguments(freeIdentifiers, variables);
            }
            variables = resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, variables);
            variables = resolveDeclarations(freeIdentifiers, this.functionScopedDeclarations, variables);
            break;
        }

        var scope = scopeType === ScopeType.GLOBAL ? new GlobalScope(this.children, variables, freeIdentifiers, astNode) : new Scope(this.children, variables, freeIdentifiers, scopeType, this.dynamic, astNode);

        return new ScopeState(freeIdentifiers, functionScope, new MultiMap(), [scope], false);
      }
    }
  }, {
    empty: {
      value: function empty() {
        return new ScopeState(new MultiMap(), new MultiMap(), new MultiMap(), [], false);
      }
    }
  });

  return ScopeState;
})();

exports["default"] = ScopeState;
//# sourceMappingURL=data:application/json;base64,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QUN0QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQ25FLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFM0YsZUFBTyxJQUFJLFVBQVUsQ0FDbkIsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJLFFBQVEsRUFBQSxFQUNaLENBQUMsS0FBSyxDQUFDLEVBQ1AsS0FBSyxDQUNOLENBQUM7T0FDSDs7O0FBN0dNLFNBQUs7YUFBQSxpQkFBRztBQUNiLGVBQU8sSUFBSSxVQUFVLENBQ25CLElBQUksUUFBUSxFQUFBLEVBQ1osSUFBSSxRQUFRLEVBQUEsRUFDWixJQUFJLFFBQVEsRUFBQSxFQUNaLEVBQUUsRUFDRixLQUFLLENBQ04sQ0FBQztPQUNIOzs7O1NBakJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJzcmMvc2NvcGUtc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE0IFNoYXBlIFNlY3VyaXR5LCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgTXVsdGlNYXAgZnJvbSBcIm11bHRpbWFwXCI7XG5cbmZ1bmN0aW9uIG1lcmdlKG11bHRpTWFwLCBvdGhlck11bHRpTWFwKSB7XG4gIG90aGVyTXVsdGlNYXAuZm9yRWFjaEVudHJ5KCh2LCBrKSA9PiB7XG4gICAgbXVsdGlNYXAuc2V0LmFwcGx5KG11bHRpTWFwLCBba10uY29uY2F0KHYpKTtcbiAgfSk7XG4gIHJldHVybiBtdWx0aU1hcDtcbn1cblxuaW1wb3J0IHtTY29wZSwgR2xvYmFsU2NvcGUsIFNjb3BlVHlwZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCBWYXJpYWJsZSBmcm9tIFwiLi92YXJpYWJsZVwiO1xuXG5mdW5jdGlvbiByZXNvbHZlQXJndW1lbnRzKGZyZWVJZGVudGlmaWVycywgdmFyaWFibGVzKSB7XG4gIGxldCBhcmdzID0gZnJlZUlkZW50aWZpZXJzLmdldChcImFyZ3VtZW50c1wiKSB8fCBbXTtcbiAgZnJlZUlkZW50aWZpZXJzLmRlbGV0ZShcImFyZ3VtZW50c1wiKTtcbiAgcmV0dXJuIHZhcmlhYmxlcy5jb25jYXQobmV3IFZhcmlhYmxlKFwiYXJndW1lbnRzXCIsIGFyZ3MsIFtdKSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCBkZWNscywgdmFyaWFibGVzKSB7XG4gIGRlY2xzLmZvckVhY2hFbnRyeSgoZGVjbGFyYXRpb25zLCBuYW1lKSA9PiB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSBmcmVlSWRlbnRpZmllcnMuZ2V0KG5hbWUpIHx8IFtdO1xuICAgIHZhcmlhYmxlcyA9IHZhcmlhYmxlcy5jb25jYXQobmV3IFZhcmlhYmxlKG5hbWUsIHJlZmVyZW5jZXMsIGRlY2xhcmF0aW9ucykpO1xuICAgIGZyZWVJZGVudGlmaWVycy5kZWxldGUobmFtZSk7XG4gIH0pO1xuICByZXR1cm4gdmFyaWFibGVzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY29wZVN0YXRlIHtcbiAgY29uc3RydWN0b3IoZnJlZUlkZW50aWZpZXJzLCBmdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucywgYmxvY2tTY29wZWREZWNsYXJhdGlvbnMsIGNoaWxkcmVuLCBkeW5hbWljKSB7XG4gICAgdGhpcy5mcmVlSWRlbnRpZmllcnMgPSBmcmVlSWRlbnRpZmllcnM7XG4gICAgdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyA9IGZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zO1xuICAgIHRoaXMuYmxvY2tTY29wZWREZWNsYXJhdGlvbnMgPSBibG9ja1Njb3BlZERlY2xhcmF0aW9ucztcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgdGhpcy5keW5hbWljID0gZHluYW1pYztcbiAgfVxuXG4gIHN0YXRpYyBlbXB0eSgpIHtcbiAgICByZXR1cm4gbmV3IFNjb3BlU3RhdGUoXG4gICAgICBuZXcgTXVsdGlNYXAsXG4gICAgICBuZXcgTXVsdGlNYXAsXG4gICAgICBuZXcgTXVsdGlNYXAsXG4gICAgICBbXSxcbiAgICAgIGZhbHNlXG4gICAgKTtcbiAgfVxuXG4gIC8qXG4gICAqIE1vbm9pZGFsIGFwcGVuZDogbWVyZ2VzIHRoZSB0d28gc3RhdGVzIHRvZ2V0aGVyXG4gICAqL1xuICBjb25jYXQoYikge1xuICAgIGlmICh0aGlzID09PSBiKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTY29wZVN0YXRlKFxuICAgICAgbWVyZ2UobWVyZ2UobmV3IE11bHRpTWFwLCB0aGlzLmZyZWVJZGVudGlmaWVycyksIGIuZnJlZUlkZW50aWZpZXJzKSxcbiAgICAgIG1lcmdlKG1lcmdlKG5ldyBNdWx0aU1hcCwgdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyksIGIuZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnMpLFxuICAgICAgbWVyZ2UobWVyZ2UobmV3IE11bHRpTWFwLCB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zKSwgYi5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucyksXG4gICAgICB0aGlzLmNoaWxkcmVuLmNvbmNhdChiLmNoaWxkcmVuKSxcbiAgICAgIHRoaXMuZHluYW1pYyB8fCBiLmR5bmFtaWNcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogT2JzZXJ2ZSBhIHZhcmlhYmxlIGVudGVyaW5nIHNjb3BlXG4gICAqL1xuICBhZGREZWNsYXJhdGlvbihkZWNsKSB7XG4gICAgbGV0IGRlY2xNYXAgPSBuZXcgTXVsdGlNYXA7XG4gICAgbWVyZ2UoZGVjbE1hcCwgZGVjbC50eXBlLmlzQmxvY2tTY29wZWQgPyB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zIDogdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyk7XG4gICAgZGVjbE1hcC5zZXQoZGVjbC5ub2RlLm5hbWUsIGRlY2wpO1xuICAgIHJldHVybiBuZXcgU2NvcGVTdGF0ZShcbiAgICAgIHRoaXMuZnJlZUlkZW50aWZpZXJzLFxuICAgICAgZGVjbC50eXBlLmlzQmxvY2tTY29wZWQgPyB0aGlzLmZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zIDogZGVjbE1hcCxcbiAgICAgIGRlY2wudHlwZS5pc0Jsb2NrU2NvcGVkID8gZGVjbE1hcCA6IHRoaXMuYmxvY2tTY29wZWREZWNsYXJhdGlvbnMsXG4gICAgICB0aGlzLmNoaWxkcmVuLFxuICAgICAgdGhpcy5keW5hbWljXG4gICAgKTtcbiAgfVxuXG4gIC8qXG4gICAqIE9ic2VydmUgYSByZWZlcmVuY2UgdG8gYSB2YXJpYWJsZVxuICAgKi9cbiAgYWRkUmVmZXJlbmNlKHJlZikge1xuICAgIGxldCBmcmVlTWFwID0gbmV3IE11bHRpTWFwO1xuICAgIG1lcmdlKGZyZWVNYXAsIHRoaXMuZnJlZUlkZW50aWZpZXJzKTtcbiAgICBmcmVlTWFwLnNldChyZWYubm9kZS5uYW1lLCByZWYpO1xuICAgIHJldHVybiBuZXcgU2NvcGVTdGF0ZShcbiAgICAgIGZyZWVNYXAsXG4gICAgICB0aGlzLmZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zLFxuICAgICAgdGhpcy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucyxcbiAgICAgIHRoaXMuY2hpbGRyZW4sXG4gICAgICB0aGlzLmR5bmFtaWNcbiAgICApO1xuICB9XG5cbiAgdGFpbnQoKSB7XG4gICAgcmV0dXJuIG5ldyBTY29wZVN0YXRlKFxuICAgICAgdGhpcy5mcmVlSWRlbnRpZmllcnMsXG4gICAgICB0aGlzLmZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb25zLFxuICAgICAgdGhpcy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucyxcbiAgICAgIHRoaXMuY2hpbGRyZW4sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qXG4gICAqIFVzZWQgd2hlbiBhIHNjb3BlIGJvdW5kYXJ5IGlzIGVuY291bnRlcmVkLiBSZXNvbHZlcyBmb3VuZCBmcmVlIGlkZW50aWZpZXJzXG4gICAqIGFuZCBkZWNsYXJhdGlvbnMgaW50byB2YXJpYWJsZSBvYmplY3RzLiBBbnkgZnJlZSBpZGVudGlmaWVycyByZW1haW5pbmcgYXJlXG4gICAqIGNhcnJpZWQgZm9yd2FyZCBpbnRvIHRoZSBuZXcgc3RhdGUgb2JqZWN0LlxuICAgKi9cbiAgZmluaXNoKGFzdE5vZGUsIHNjb3BlVHlwZSkge1xuICAgIGxldCB2YXJpYWJsZXMgPSBbXTtcbiAgICBsZXQgZnVuY3Rpb25TY29wZSA9IG5ldyBNdWx0aU1hcDtcbiAgICBsZXQgZnJlZUlkZW50aWZpZXJzID0gbmV3IE11bHRpTWFwO1xuXG4gICAgbWVyZ2UoZnJlZUlkZW50aWZpZXJzLCB0aGlzLmZyZWVJZGVudGlmaWVycyk7XG5cbiAgICBzd2l0Y2ggKHNjb3BlVHlwZSkge1xuICAgIGNhc2UgU2NvcGVUeXBlLkJMT0NLOlxuICAgIGNhc2UgU2NvcGVUeXBlLkNBVENIOlxuICAgIGNhc2UgU2NvcGVUeXBlLldJVEg6XG4gICAgICAvLyByZXNvbHZlIHJlZmVyZW5jZXMgdG8gb25seSBibG9jay1zY29wZWQgZnJlZSBkZWNsYXJhdGlvbnNcbiAgICAgIHZhcmlhYmxlcyA9IHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLCB2YXJpYWJsZXMpO1xuICAgICAgbWVyZ2UoZnVuY3Rpb25TY29wZSwgdGhpcy5mdW5jdGlvblNjb3BlZERlY2xhcmF0aW9ucyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gcmVzb2x2ZSByZWZlcmVuY2VzIHRvIGJvdGggYmxvY2stc2NvcGVkIGFuZCBmdW5jdGlvbi1zY29wZWQgZnJlZSBkZWNsYXJhdGlvbnNcbiAgICAgIGlmIChzY29wZVR5cGUgPT09IFNjb3BlVHlwZS5GVU5DVElPTikge1xuICAgICAgICB2YXJpYWJsZXMgPSByZXNvbHZlQXJndW1lbnRzKGZyZWVJZGVudGlmaWVycywgdmFyaWFibGVzKTtcbiAgICAgIH1cbiAgICAgIHZhcmlhYmxlcyA9IHJlc29sdmVEZWNsYXJhdGlvbnMoZnJlZUlkZW50aWZpZXJzLCB0aGlzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLCB2YXJpYWJsZXMpO1xuICAgICAgdmFyaWFibGVzID0gcmVzb2x2ZURlY2xhcmF0aW9ucyhmcmVlSWRlbnRpZmllcnMsIHRoaXMuZnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbnMsIHZhcmlhYmxlcyk7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgc2NvcGUgPSBzY29wZVR5cGUgPT09IFNjb3BlVHlwZS5HTE9CQUxcbiAgICAgID8gbmV3IEdsb2JhbFNjb3BlKHRoaXMuY2hpbGRyZW4sIHZhcmlhYmxlcywgZnJlZUlkZW50aWZpZXJzLCBhc3ROb2RlKVxuICAgICAgOiBuZXcgU2NvcGUodGhpcy5jaGlsZHJlbiwgdmFyaWFibGVzLCBmcmVlSWRlbnRpZmllcnMsIHNjb3BlVHlwZSwgdGhpcy5keW5hbWljLCBhc3ROb2RlKTtcblxuICAgIHJldHVybiBuZXcgU2NvcGVTdGF0ZShcbiAgICAgIGZyZWVJZGVudGlmaWVycyxcbiAgICAgIGZ1bmN0aW9uU2NvcGUsXG4gICAgICBuZXcgTXVsdGlNYXAsXG4gICAgICBbc2NvcGVdLFxuICAgICAgZmFsc2VcbiAgICApO1xuICB9XG59XG4iXX0=