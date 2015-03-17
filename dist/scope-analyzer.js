"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

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

var _shiftReducer = require("shift-reducer");

var reduce = _shiftReducer["default"];
var MonoidalReducer = _shiftReducer.MonoidalReducer;

var ScopeState = require("./scope-state")["default"];

var _reference = require("./reference");

var ReadReference = _reference.ReadReference;
var WriteReference = _reference.WriteReference;
var ReadWriteReference = _reference.ReadWriteReference;

var _declaration = require("./declaration");

var Declaration = _declaration.Declaration;
var VarDeclaration = _declaration.VarDeclaration;
var ConstDeclaration = _declaration.ConstDeclaration;
var LetDeclaration = _declaration.LetDeclaration;
var CatchDeclaration = _declaration.CatchDeclaration;
var ParameterDeclaration = _declaration.ParameterDeclaration;
var FunctionNameDeclaration = _declaration.FunctionNameDeclaration;

var ScopeType = require("./scope").ScopeType;

var ScopeAnalyzer = (function (_MonoidalReducer) {
  function ScopeAnalyzer() {
    _classCallCheck(this, ScopeAnalyzer);

    _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "constructor", this).call(this, ScopeState);
  }

  _inherits(ScopeAnalyzer, _MonoidalReducer);

  _createClass(ScopeAnalyzer, {
    reduceAssignmentExpression: {
      value: function reduceAssignmentExpression(node, binding, expression) {
        if (node.binding.type === "IdentifierExpression") {
          var ReferenceCtor = node.operator === "=" ? WriteReference : ReadWriteReference;
          return expression.addReference(new ReferenceCtor(node.binding.identifier));
        }
        return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceAssignmentExpression", this).call(this, node, binding, expression);
      }
    },
    reduceBlock: {
      value: function reduceBlock(node, statements) {
        var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceBlock", this).call(this, node, statements);
        if (s.blockScopedDeclarations.size > 0) {
          s = s.finish(node, ScopeType.BLOCK);
        }
        return s;
      }
    },
    reduceCallExpression: {
      value: function reduceCallExpression(node, callee, args) {
        var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceCallExpression", this).call(this, node, callee, args);
        if (node.callee.type === "IdentifierExpression" && node.callee.identifier.name === "eval") {
          return s.taint();
        }
        return s;
      }
    },
    reduceCatchClause: {
      value: function reduceCatchClause(node, binding, body) {
        return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceCatchClause", this).call(this, node, binding, body).addDeclaration(new CatchDeclaration(node.binding)).finish(node, ScopeType.CATCH);
      }
    },
    reduceForInStatement: {
      value: function reduceForInStatement(node, left, right, body) {
        if (node.left.type === "VariableDeclaration") {
          var declarator = node.left.declarators[0];
          if (declarator.init == null) {
            left = left.addReference(new WriteReference(declarator.binding));
          }
          if (left.blockScopedDeclarations.size > 0) {
            return this.append(this.append(left, body).finish(node, ScopeType.BLOCK), right);
          }
          return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForInStatement", this).call(this, node, left, right, body);
        }
        return this.append(right, body).addReference(new WriteReference(node.left.identifier));
      }
    },
    reduceForStatement: {
      value: function reduceForStatement(node, init, test, update, body) {
        var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForStatement", this).call(this, node, init, test, update, body);
        if (node.init != null && node.init.type === "VariableDeclaration" && init.blockScopedDeclarations.size > 0) {
          return s.finish(node, ScopeType.BLOCK);
        }
        return s;
      }
    },
    reduceFunctionDeclaration: {
      value: function reduceFunctionDeclaration(node, name, parameters, functionBody) {
        return node.parameters.reduce(function (s, p) {
          return s.addDeclaration(new ParameterDeclaration(p));
        }, functionBody).finish(node, ScopeType.FUNCTION).addDeclaration(new FunctionNameDeclaration(node.name));
      }
    },
    reduceFunctionExpression: {
      value: function reduceFunctionExpression(node, name, parameters, functionBody) {
        var s = node.parameters.reduce(function (s, p) {
          return s.addDeclaration(new ParameterDeclaration(p));
        }, functionBody).finish(node, ScopeType.FUNCTION);
        if (name != null) {
          s = s.addDeclaration(new FunctionNameDeclaration(node.name)).finish(node, ScopeType.FUNCTION_NAME);
        }
        return s;
      }
    },
    reduceGetter: {
      value: function reduceGetter(node, name, body) {
        return body.finish(node, ScopeType.FUNCTION);
      }
    },
    reduceIdentifierExpression: {
      value: function reduceIdentifierExpression(node, identifier) {
        return this.identity.addReference(new ReadReference(node.identifier));
      }
    },
    reducePostfixExpression: {
      value: function reducePostfixExpression(node, operand) {
        if (node.operand.type === "IdentifierExpression") {
          return this.identity.addReference(new ReadWriteReference(node.operand.identifier));
        }
        return operand;
      }
    },
    reducePrefixExpression: {
      value: function reducePrefixExpression(node, operand) {
        if ((node.operator === "--" || node.operator === "++") && node.operand.type === "IdentifierExpression") {
          return this.identity.addReference(new ReadWriteReference(node.operand.identifier));
        }
        return operand;
      }
    },
    reduceScript: {
      value: function reduceScript(node, body) {
        return body.finish(node, ScopeType.GLOBAL);
      }
    },
    reduceSetter: {
      value: function reduceSetter(node, name, parameter, body) {
        return body.addDeclaration(new ParameterDeclaration(node.parameter)).finish(node, ScopeType.FUNCTION);
      }
    },
    reduceVariableDeclaration: {
      value: function reduceVariableDeclaration(node, declarators) {
        return node.declarators.reduce(function (s, d) {
          return s.addDeclaration(Declaration.fromVarDeclKind(d.binding, node.kind));
        }, _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceVariableDeclaration", this).call(this, node, declarators));
      }
    },
    reduceVariableDeclarator: {
      value: function reduceVariableDeclarator(node, binding, init) {
        var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceVariableDeclarator", this).call(this, node, binding, init);
        if (init != null) {
          s = s.addReference(new WriteReference(node.binding));
        }
        return s;
      }
    },
    reduceWithStatement: {
      value: function reduceWithStatement(node, object, body) {
        return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceWithStatement", this).call(this, node, object, body.finish(node, ScopeType.WITH));
      }
    }
  }, {
    analyze: {
      value: function analyze(script) {
        return reduce(new this(), script).children[0];
      }
    }
  });

  return ScopeAnalyzer;
})(MonoidalReducer);

exports["default"] = ScopeAnalyzer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY29wZS1hbmFseXplci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFnQnNDLGVBQWU7O0lBQTlDLE1BQU07SUFBRyxlQUFlLGlCQUFmLGVBQWU7O0lBQ3hCLFVBQVUsV0FBTSxlQUFlOzt5QkFDMEIsYUFBYTs7SUFBckUsYUFBYSxjQUFiLGFBQWE7SUFBRSxjQUFjLGNBQWQsY0FBYztJQUFFLGtCQUFrQixjQUFsQixrQkFBa0I7OzJCQUNvRixlQUFlOztJQUFwSixXQUFXLGdCQUFYLFdBQVc7SUFBRSxjQUFjLGdCQUFkLGNBQWM7SUFBRSxnQkFBZ0IsZ0JBQWhCLGdCQUFnQjtJQUFFLGNBQWMsZ0JBQWQsY0FBYztJQUFFLGdCQUFnQixnQkFBaEIsZ0JBQWdCO0lBQUUsb0JBQW9CLGdCQUFwQixvQkFBb0I7SUFBRSx1QkFBdUIsZ0JBQXZCLHVCQUF1Qjs7SUFDOUgsU0FBUyxXQUFPLFNBQVMsRUFBekIsU0FBUzs7SUFFSSxhQUFhO0FBRXJCLFdBRlEsYUFBYSxHQUVsQjswQkFGSyxhQUFhOztBQUc5QiwrQkFIaUIsYUFBYSw2Q0FHeEIsVUFBVSxFQUFFO0dBQ25COztZQUprQixhQUFhOztlQUFiLGFBQWE7QUFVaEMsOEJBQTBCO2FBQUEsb0NBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUU7QUFDcEQsWUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxzQkFBc0IsRUFBRTtBQUNoRCxjQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsR0FBRyxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFDaEYsaUJBQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDNUU7QUFDRCwwQ0FmaUIsYUFBYSw0REFlVSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtP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Q0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM3Qzs7OztTQVJrQixhQUFhO0dBQVMsZUFBZTs7cUJBQXJDLGFBQWEiLCJmaWxlIjoic3JjL3Njb3BlLWFuYWx5emVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBTaGFwZSBTZWN1cml0eSwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCByZWR1Y2UsIHtNb25vaWRhbFJlZHVjZXJ9IGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQgU2NvcGVTdGF0ZSBmcm9tIFwiLi9zY29wZS1zdGF0ZVwiO1xuaW1wb3J0IHtSZWFkUmVmZXJlbmNlLCBXcml0ZVJlZmVyZW5jZSwgUmVhZFdyaXRlUmVmZXJlbmNlfSBmcm9tIFwiLi9yZWZlcmVuY2VcIjtcbmltcG9ydCB7RGVjbGFyYXRpb24sIFZhckRlY2xhcmF0aW9uLCBDb25zdERlY2xhcmF0aW9uLCBMZXREZWNsYXJhdGlvbiwgQ2F0Y2hEZWNsYXJhdGlvbiwgUGFyYW1ldGVyRGVjbGFyYXRpb24sIEZ1bmN0aW9uTmFtZURlY2xhcmF0aW9ufSBmcm9tIFwiLi9kZWNsYXJhdGlvblwiO1xuaW1wb3J0IHtTY29wZVR5cGV9IGZyb20gXCIuL3Njb3BlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlQW5hbHl6ZXIgZXh0ZW5kcyBNb25vaWRhbFJlZHVjZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFNjb3BlU3RhdGUpO1xuICB9XG5cbiAgc3RhdGljIGFuYWx5emUoc2NyaXB0KSB7XG4gICAgcmV0dXJuIHJlZHVjZShuZXcgdGhpcywgc2NyaXB0KS5jaGlsZHJlblswXTtcbiAgfVxuXG4gIHJlZHVjZUFzc2lnbm1lbnRFeHByZXNzaW9uKG5vZGUsIGJpbmRpbmcsIGV4cHJlc3Npb24pIHtcbiAgICBpZiAobm9kZS5iaW5kaW5nLnR5cGUgPT09IFwiSWRlbnRpZmllckV4cHJlc3Npb25cIikge1xuICAgICAgbGV0IFJlZmVyZW5jZUN0b3IgPSBub2RlLm9wZXJhdG9yID09PSBcIj1cIiA/IFdyaXRlUmVmZXJlbmNlIDogUmVhZFdyaXRlUmVmZXJlbmNlO1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb24uYWRkUmVmZXJlbmNlKG5ldyBSZWZlcmVuY2VDdG9yKG5vZGUuYmluZGluZy5pZGVudGlmaWVyKSk7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5yZWR1Y2VBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlLCBiaW5kaW5nLCBleHByZXNzaW9uKTtcbiAgfVxuXG4gIHJlZHVjZUJsb2NrKG5vZGUsIHN0YXRlbWVudHMpIHtcbiAgICBsZXQgcyA9IHN1cGVyLnJlZHVjZUJsb2NrKG5vZGUsIHN0YXRlbWVudHMpO1xuICAgIGlmIChzLmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLnNpemUgPiAwKSB7XG4gICAgICBzID0gcy5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkJMT0NLKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICByZWR1Y2VDYWxsRXhwcmVzc2lvbihub2RlLCBjYWxsZWUsIGFyZ3MpIHtcbiAgICBsZXQgcyA9IHN1cGVyLnJlZHVjZUNhbGxFeHByZXNzaW9uKG5vZGUsIGNhbGxlZSwgYXJncyk7XG4gICAgaWYgKG5vZGUuY2FsbGVlLnR5cGUgPT09IFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiAmJiBub2RlLmNhbGxlZS5pZGVudGlmaWVyLm5hbWUgPT09IFwiZXZhbFwiKSB7XG4gICAgICByZXR1cm4gcy50YWludCgpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxuXG4gIHJlZHVjZUNhdGNoQ2xhdXNlKG5vZGUsIGJpbmRpbmcsIGJvZHkpIHtcbiAgICByZXR1cm4gc3VwZXIucmVkdWNlQ2F0Y2hDbGF1c2Uobm9kZSwgYmluZGluZywgYm9keSlcbiAgICAgIC5hZGREZWNsYXJhdGlvbihuZXcgQ2F0Y2hEZWNsYXJhdGlvbihub2RlLmJpbmRpbmcpKVxuICAgICAgLmZpbmlzaChub2RlLCBTY29wZVR5cGUuQ0FUQ0gpO1xuICB9XG5cbiAgcmVkdWNlRm9ySW5TdGF0ZW1lbnQobm9kZSwgbGVmdCwgcmlnaHQsIGJvZHkpIHtcbiAgICBpZiAobm9kZS5sZWZ0LnR5cGUgPT09IFwiVmFyaWFibGVEZWNsYXJhdGlvblwiKSB7XG4gICAgICBsZXQgZGVjbGFyYXRvciA9IG5vZGUubGVmdC5kZWNsYXJhdG9yc1swXTtcbiAgICAgIGlmIChkZWNsYXJhdG9yLmluaXQgPT0gbnVsbCkge1xuICAgICAgICBsZWZ0ID0gbGVmdC5hZGRSZWZlcmVuY2UobmV3IFdyaXRlUmVmZXJlbmNlKGRlY2xhcmF0b3IuYmluZGluZykpO1xuICAgICAgfVxuICAgICAgaWYgKGxlZnQuYmxvY2tTY29wZWREZWNsYXJhdGlvbnMuc2l6ZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwZW5kKHRoaXMuYXBwZW5kKGxlZnQsIGJvZHkpLmZpbmlzaChub2RlLCBTY29wZVR5cGUuQkxPQ0spLCByaWdodCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VwZXIucmVkdWNlRm9ySW5TdGF0ZW1lbnQobm9kZSwgbGVmdCwgcmlnaHQsIGJvZHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hcHBlbmQocmlnaHQsIGJvZHkpLmFkZFJlZmVyZW5jZShuZXcgV3JpdGVSZWZlcmVuY2Uobm9kZS5sZWZ0LmlkZW50aWZpZXIpKTtcbiAgfVxuXG4gIHJlZHVjZUZvclN0YXRlbWVudChub2RlLCBpbml0LCB0ZXN0LCB1cGRhdGUsIGJvZHkpIHtcbiAgICBsZXQgcyA9IHN1cGVyLnJlZHVjZUZvclN0YXRlbWVudChub2RlLCBpbml0LCB0ZXN0LCB1cGRhdGUsIGJvZHkpO1xuICAgIGlmIChub2RlLmluaXQgIT0gbnVsbCAmJiBub2RlLmluaXQudHlwZSA9PT0gXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIgJiYgaW5pdC5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucy5zaXplID4gMCkge1xuICAgICAgcmV0dXJuIHMuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5CTE9DSyk7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgcmVkdWNlRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlLCBuYW1lLCBwYXJhbWV0ZXJzLCBmdW5jdGlvbkJvZHkpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJhbWV0ZXJzLnJlZHVjZSgocywgcCkgPT4gcy5hZGREZWNsYXJhdGlvbihuZXcgUGFyYW1ldGVyRGVjbGFyYXRpb24ocCkpLCBmdW5jdGlvbkJvZHkpXG4gICAgICAuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5GVU5DVElPTilcbiAgICAgIC5hZGREZWNsYXJhdGlvbihuZXcgRnVuY3Rpb25OYW1lRGVjbGFyYXRpb24obm9kZS5uYW1lKSk7XG4gIH1cblxuICByZWR1Y2VGdW5jdGlvbkV4cHJlc3Npb24obm9kZSwgbmFtZSwgcGFyYW1ldGVycywgZnVuY3Rpb25Cb2R5KSB7XG4gICAgbGV0IHMgPSBub2RlLnBhcmFtZXRlcnMucmVkdWNlKChzLCBwKSA9PiBzLmFkZERlY2xhcmF0aW9uKG5ldyBQYXJhbWV0ZXJEZWNsYXJhdGlvbihwKSksIGZ1bmN0aW9uQm9keSlcbiAgICAgIC5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkZVTkNUSU9OKTtcbiAgICBpZiAobmFtZSAhPSBudWxsKSB7XG4gICAgICBzID0gcy5hZGREZWNsYXJhdGlvbihuZXcgRnVuY3Rpb25OYW1lRGVjbGFyYXRpb24obm9kZS5uYW1lKSlcbiAgICAgICAgLmZpbmlzaChub2RlLCBTY29wZVR5cGUuRlVOQ1RJT05fTkFNRSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgcmVkdWNlR2V0dGVyKG5vZGUsIG5hbWUsIGJvZHkpIHtcbiAgICByZXR1cm4gYm9keS5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkZVTkNUSU9OKTtcbiAgfVxuXG4gIHJlZHVjZUlkZW50aWZpZXJFeHByZXNzaW9uKG5vZGUsIGlkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gdGhpcy5pZGVudGl0eS5hZGRSZWZlcmVuY2UobmV3IFJlYWRSZWZlcmVuY2Uobm9kZS5pZGVudGlmaWVyKSk7XG4gIH1cblxuICByZWR1Y2VQb3N0Zml4RXhwcmVzc2lvbihub2RlLCBvcGVyYW5kKSB7XG4gICAgaWYgKG5vZGUub3BlcmFuZC50eXBlID09PSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmlkZW50aXR5LmFkZFJlZmVyZW5jZShuZXcgUmVhZFdyaXRlUmVmZXJlbmNlKG5vZGUub3BlcmFuZC5pZGVudGlmaWVyKSk7XG4gICAgfVxuICAgIHJldHVybiBvcGVyYW5kO1xuICB9XG5cbiAgcmVkdWNlUHJlZml4RXhwcmVzc2lvbihub2RlLCBvcGVyYW5kKSB7XG4gICAgaWYgKChub2RlLm9wZXJhdG9yID09PSBcIi0tXCIgfHwgbm9kZS5vcGVyYXRvciA9PT0gXCIrK1wiKSAmJiBub2RlLm9wZXJhbmQudHlwZSA9PT0gXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZGVudGl0eS5hZGRSZWZlcmVuY2UobmV3IFJlYWRXcml0ZVJlZmVyZW5jZShub2RlLm9wZXJhbmQuaWRlbnRpZmllcikpO1xuICAgIH1cbiAgICByZXR1cm4gb3BlcmFuZDtcbiAgfVxuXG4gIHJlZHVjZVNjcmlwdChub2RlLCBib2R5KSB7XG4gICAgcmV0dXJuIGJvZHkuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5HTE9CQUwpO1xuICB9XG5cbiAgcmVkdWNlU2V0dGVyKG5vZGUsIG5hbWUsIHBhcmFtZXRlciwgYm9keSkge1xuICAgIHJldHVybiBib2R5LmFkZERlY2xhcmF0aW9uKG5ldyBQYXJhbWV0ZXJEZWNsYXJhdGlvbihub2RlLnBhcmFtZXRlcikpXG4gICAgICAuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5GVU5DVElPTik7XG4gIH1cblxuICByZWR1Y2VWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUsIGRlY2xhcmF0b3JzKSB7XG4gICAgcmV0dXJuIG5vZGUuZGVjbGFyYXRvcnMucmVkdWNlKFxuICAgICAgKHMsIGQpID0+IHMuYWRkRGVjbGFyYXRpb24oRGVjbGFyYXRpb24uZnJvbVZhckRlY2xLaW5kKGQuYmluZGluZywgbm9kZS5raW5kKSksXG4gICAgICBzdXBlci5yZWR1Y2VWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUsIGRlY2xhcmF0b3JzKVxuICAgICk7XG4gIH1cblxuICByZWR1Y2VWYXJpYWJsZURlY2xhcmF0b3Iobm9kZSwgYmluZGluZywgaW5pdCkge1xuICAgIGxldCBzID0gc3VwZXIucmVkdWNlVmFyaWFibGVEZWNsYXJhdG9yKG5vZGUsIGJpbmRpbmcsIGluaXQpO1xuICAgIGlmIChpbml0ICE9IG51bGwpIHtcbiAgICAgIHMgPSBzLmFkZFJlZmVyZW5jZShuZXcgV3JpdGVSZWZlcmVuY2Uobm9kZS5iaW5kaW5nKSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgcmVkdWNlV2l0aFN0YXRlbWVudChub2RlLCBvYmplY3QsIGJvZHkpIHtcbiAgICByZXR1cm4gc3VwZXIucmVkdWNlV2l0aFN0YXRlbWVudChub2RlLCBvYmplY3QsIGJvZHkuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5XSVRIKSk7XG4gIH1cbn1cbiJdfQ==