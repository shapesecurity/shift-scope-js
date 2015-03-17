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
        if (node.init.type === "VariableDeclaration" && init.blockScopedDeclarations.size > 0) {
          return this.append3(this.append(init, body).finish(node, ScopeType.BLOCK), test, update);
        }
        return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForStatement", this).call(this, node, init, test, update, body);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY29wZS1hbmFseXplci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFnQnNDLGVBQWU7O0lBQTlDLE1BQU07SUFBRyxlQUFlLGlCQUFmLGVBQWU7O0lBQ3hCLFVBQVUsV0FBTSxlQUFlOzt5QkFDMEIsYUFBYTs7SUFBckUsYUFBYSxjQUFiLGFBQWE7SUFBRSxjQUFjLGNBQWQsY0FBYztJQUFFLGtCQUFrQixjQUFsQixrQkFBa0I7OzJCQUNvRixlQUFlOztJQUFwSixXQUFXLGdCQUFYLFdBQVc7SUFBRSxjQUFjLGdCQUFkLGNBQWM7SUFBRSxnQkFBZ0IsZ0JBQWhCLGdCQUFnQjtJQUFFLGNBQWMsZ0JBQWQsY0FBYztJQUFFLGdCQUFnQixnQkFBaEIsZ0JBQWdCO0lBQUUsb0JBQW9CLGdCQUFwQixvQkFBb0I7SUFBRSx1QkFBdUIsZ0JBQXZCLHVCQUF1Qjs7SUFDOUgsU0FBUyxXQUFPLFNBQVMsRUFBekIsU0FBUzs7SUFFSSxhQUFhO0FBRXJCLFdBRlEsYUFBYSxHQUVsQjswQkFGSyxhQUFhOztBQUc5QiwrQkFIaUIsYUFBYSw2Q0FHeEIsVUFBVSxFQUFFO0dBQ25COztZQUprQixhQUFhOztlQUFiLGFBQWE7QUFVaEMsOEJBQTBCO2FBQUEsb0NBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUU7QUFDcEQsWUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxzQkFBc0IsRUFBRTtBQUNoRCxjQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsR0FBRyxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFDaEYsaUJBQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDNUU7QUFDRCwwQ0FmaUIsYUFBYSw0REFlVSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRTtPQUNwRTs7QUFFRCxlQUFXO2FBQUEscUJBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtBQUM1QixZQUFJLENBQUMsOEJBbkJZLGFBQWEsNkNBbUJKLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1QyxZQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3RDLFdBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckM7QUFDRCxlQUFPLENBQUMsQ0FBQztPQUNWOztBQUVELHdCQUFvQjthQUFBLDhCQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyw4QkEzQlksYUFBYSxzREEyQkssSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2RCxZQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLHNCQUFzQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDekYsaUJBQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xCO0FBQ0QsZUFBTyxDQUFDLENBQUM7T0FDVjs7QUFFRCxxQkFBaUI7YUFBQSwyQkFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNyQyxlQUFPLDJCQW5DVSxhQUFhLG1EQW1DQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFDL0MsY0FBYyxDQUFDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQ2xELE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2xDOztBQUVELHdCQUFvQjthQUFBLDhCQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUM1QyxZQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLHFCQUFxQixFQUFFO0FBQzVDLGNBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLGNBQUksVUFBVSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDM0IsZ0JBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1dBQ2xFO0FBQ0QsY0FBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUN6QyxtQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQ2xGO0FBQ0QsNENBakRlLGFBQWEsc0RBaURNLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtTQUM1RDtBQUNELGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztPQUN4Rjs7QUFFRCxzQkFBa0I7YUFBQSw0QkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2pELFlBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUsscUJBQXFCLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDckYsaUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDMUY7QUFDRCwwQ0ExRGlCLGFBQWEsb0RBMERFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7T0FDakU7O0FBRUQsNkJBQXlCO2FBQUEsbUNBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFO0FBQzlELGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztpQkFBSyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxFQUFFLFlBQVksQ0FBQyxDQUNqRyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FDaEMsY0FBYyxDQUFDLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDM0Q7O0FBRUQsNEJBQXdCO2FBQUEsa0NBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFO0FBQzdELFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7aUJBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUEsRUFBRSxZQUFZLENBQUMsQ0FDbEcsTUFBTSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsWUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLFdBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3pELE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzFDO0FBQ0QsZUFBTyxDQUFDLENBQUM7T0FDVjs7QUFFRCxnQkFBWTthQUFBLHNCQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQzdCLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzlDOztBQUVELDhCQUEwQjthQUFBLG9DQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7QUFDM0MsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztPQUN2RTs7QUFFRCwyQkFBdUI7YUFBQSxpQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3JDLFlBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssc0JBQXNCLEVBQUU7QUFDaEQsaUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDcEY7QUFDRCxlQUFPLE9BQU8sQ0FBQztPQUNoQjs7QUFFRCwwQkFBc0I7YUFBQSxnQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3BDLFlBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQSxJQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLHNCQUFzQixFQUFFO0FBQ3RHLGlCQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ3BGO0FBQ0QsZUFBTyxPQUFPLENBQUM7T0FDaEI7O0FBRUQsZ0JBQVk7YUFBQSxzQkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzVDOztBQUVELGdCQUFZO2FBQUEsc0JBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO0FBQ3hDLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUNqRSxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNyQzs7QUFFRCw2QkFBeUI7YUFBQSxtQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQzNDLGVBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQzVCLFVBQUMsQ0FBQyxFQUFFLENBQUM7aUJBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQUEsNkJBOUc5RCxhQUFhLDJEQStHSSxJQUFJLEVBQUUsV0FBVyxFQUNsRCxDQUFDO09BQ0g7O0FBRUQsNEJBQXdCO2FBQUEsa0NBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDNUMsWUFBSSxDQUFDLDhCQXBIWSxhQUFhLDBEQW9IUyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVELFlBQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixXQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN0RDtBQUNELGVBQU8sQ0FBQyxDQUFDO09BQ1Y7O0FBRUQsdUJBQW1CO2FBQUEsNkJBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDdEMsMENBNUhpQixhQUFhLHFEQTRIRyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtPQUNuRjs7O0FBdkhNLFdBQU87YUFBQSxpQkFBQyxNQUFNLEVBQUU7QUFDckIsZUFBTyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUEsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDN0M7Ozs7U0FSa0IsYUFBYTtHQUFTLGVBQWU7O3FCQUFyQyxhQUFhIiwiZmlsZSI6InNyYy9zY29wZS1hbmFseXplci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTQgU2hhcGUgU2VjdXJpdHksIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgcmVkdWNlLCB7TW9ub2lkYWxSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IFNjb3BlU3RhdGUgZnJvbSBcIi4vc2NvcGUtc3RhdGVcIjtcbmltcG9ydCB7UmVhZFJlZmVyZW5jZSwgV3JpdGVSZWZlcmVuY2UsIFJlYWRXcml0ZVJlZmVyZW5jZX0gZnJvbSBcIi4vcmVmZXJlbmNlXCI7XG5pbXBvcnQge0RlY2xhcmF0aW9uLCBWYXJEZWNsYXJhdGlvbiwgQ29uc3REZWNsYXJhdGlvbiwgTGV0RGVjbGFyYXRpb24sIENhdGNoRGVjbGFyYXRpb24sIFBhcmFtZXRlckRlY2xhcmF0aW9uLCBGdW5jdGlvbk5hbWVEZWNsYXJhdGlvbn0gZnJvbSBcIi4vZGVjbGFyYXRpb25cIjtcbmltcG9ydCB7U2NvcGVUeXBlfSBmcm9tIFwiLi9zY29wZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY29wZUFuYWx5emVyIGV4dGVuZHMgTW9ub2lkYWxSZWR1Y2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTY29wZVN0YXRlKTtcbiAgfVxuXG4gIHN0YXRpYyBhbmFseXplKHNjcmlwdCkge1xuICAgIHJldHVybiByZWR1Y2UobmV3IHRoaXMsIHNjcmlwdCkuY2hpbGRyZW5bMF07XG4gIH1cblxuICByZWR1Y2VBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlLCBiaW5kaW5nLCBleHByZXNzaW9uKSB7XG4gICAgaWYgKG5vZGUuYmluZGluZy50eXBlID09PSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgIGxldCBSZWZlcmVuY2VDdG9yID0gbm9kZS5vcGVyYXRvciA9PT0gXCI9XCIgPyBXcml0ZVJlZmVyZW5jZSA6IFJlYWRXcml0ZVJlZmVyZW5jZTtcbiAgICAgIHJldHVybiBleHByZXNzaW9uLmFkZFJlZmVyZW5jZShuZXcgUmVmZXJlbmNlQ3Rvcihub2RlLmJpbmRpbmcuaWRlbnRpZmllcikpO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIucmVkdWNlQXNzaWdubWVudEV4cHJlc3Npb24obm9kZSwgYmluZGluZywgZXhwcmVzc2lvbik7XG4gIH1cblxuICByZWR1Y2VCbG9jayhub2RlLCBzdGF0ZW1lbnRzKSB7XG4gICAgbGV0IHMgPSBzdXBlci5yZWR1Y2VCbG9jayhub2RlLCBzdGF0ZW1lbnRzKTtcbiAgICBpZiAocy5ibG9ja1Njb3BlZERlY2xhcmF0aW9ucy5zaXplID4gMCkge1xuICAgICAgcyA9IHMuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5CTE9DSyk7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgcmVkdWNlQ2FsbEV4cHJlc3Npb24obm9kZSwgY2FsbGVlLCBhcmdzKSB7XG4gICAgbGV0IHMgPSBzdXBlci5yZWR1Y2VDYWxsRXhwcmVzc2lvbihub2RlLCBjYWxsZWUsIGFyZ3MpO1xuICAgIGlmIChub2RlLmNhbGxlZS50eXBlID09PSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCIgJiYgbm9kZS5jYWxsZWUuaWRlbnRpZmllci5uYW1lID09PSBcImV2YWxcIikge1xuICAgICAgcmV0dXJuIHMudGFpbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICByZWR1Y2VDYXRjaENsYXVzZShub2RlLCBiaW5kaW5nLCBib2R5KSB7XG4gICAgcmV0dXJuIHN1cGVyLnJlZHVjZUNhdGNoQ2xhdXNlKG5vZGUsIGJpbmRpbmcsIGJvZHkpXG4gICAgICAuYWRkRGVjbGFyYXRpb24obmV3IENhdGNoRGVjbGFyYXRpb24obm9kZS5iaW5kaW5nKSlcbiAgICAgIC5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkNBVENIKTtcbiAgfVxuXG4gIHJlZHVjZUZvckluU3RhdGVtZW50KG5vZGUsIGxlZnQsIHJpZ2h0LCBib2R5KSB7XG4gICAgaWYgKG5vZGUubGVmdC50eXBlID09PSBcIlZhcmlhYmxlRGVjbGFyYXRpb25cIikge1xuICAgICAgbGV0IGRlY2xhcmF0b3IgPSBub2RlLmxlZnQuZGVjbGFyYXRvcnNbMF07XG4gICAgICBpZiAoZGVjbGFyYXRvci5pbml0ID09IG51bGwpIHtcbiAgICAgICAgbGVmdCA9IGxlZnQuYWRkUmVmZXJlbmNlKG5ldyBXcml0ZVJlZmVyZW5jZShkZWNsYXJhdG9yLmJpbmRpbmcpKTtcbiAgICAgIH1cbiAgICAgIGlmIChsZWZ0LmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLnNpemUgPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcGVuZCh0aGlzLmFwcGVuZChsZWZ0LCBib2R5KS5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkJMT0NLKSwgcmlnaHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1cGVyLnJlZHVjZUZvckluU3RhdGVtZW50KG5vZGUsIGxlZnQsIHJpZ2h0LCBib2R5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kKHJpZ2h0LCBib2R5KS5hZGRSZWZlcmVuY2UobmV3IFdyaXRlUmVmZXJlbmNlKG5vZGUubGVmdC5pZGVudGlmaWVyKSk7XG4gIH1cblxuICByZWR1Y2VGb3JTdGF0ZW1lbnQobm9kZSwgaW5pdCwgdGVzdCwgdXBkYXRlLCBib2R5KSB7XG4gICAgaWYgKG5vZGUuaW5pdC50eXBlID09PSBcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiAmJiBpbml0LmJsb2NrU2NvcGVkRGVjbGFyYXRpb25zLnNpemUgPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcHBlbmQzKHRoaXMuYXBwZW5kKGluaXQsIGJvZHkpLmZpbmlzaChub2RlLCBTY29wZVR5cGUuQkxPQ0spLCB0ZXN0LCB1cGRhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIucmVkdWNlRm9yU3RhdGVtZW50KG5vZGUsIGluaXQsIHRlc3QsIHVwZGF0ZSwgYm9keSk7XG4gIH1cblxuICByZWR1Y2VGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUsIG5hbWUsIHBhcmFtZXRlcnMsIGZ1bmN0aW9uQm9keSkge1xuICAgIHJldHVybiBub2RlLnBhcmFtZXRlcnMucmVkdWNlKChzLCBwKSA9PiBzLmFkZERlY2xhcmF0aW9uKG5ldyBQYXJhbWV0ZXJEZWNsYXJhdGlvbihwKSksIGZ1bmN0aW9uQm9keSlcbiAgICAgIC5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkZVTkNUSU9OKVxuICAgICAgLmFkZERlY2xhcmF0aW9uKG5ldyBGdW5jdGlvbk5hbWVEZWNsYXJhdGlvbihub2RlLm5hbWUpKTtcbiAgfVxuXG4gIHJlZHVjZUZ1bmN0aW9uRXhwcmVzc2lvbihub2RlLCBuYW1lLCBwYXJhbWV0ZXJzLCBmdW5jdGlvbkJvZHkpIHtcbiAgICBsZXQgcyA9IG5vZGUucGFyYW1ldGVycy5yZWR1Y2UoKHMsIHApID0+IHMuYWRkRGVjbGFyYXRpb24obmV3IFBhcmFtZXRlckRlY2xhcmF0aW9uKHApKSwgZnVuY3Rpb25Cb2R5KVxuICAgICAgLmZpbmlzaChub2RlLCBTY29wZVR5cGUuRlVOQ1RJT04pO1xuICAgIGlmIChuYW1lICE9IG51bGwpIHtcbiAgICAgIHMgPSBzLmFkZERlY2xhcmF0aW9uKG5ldyBGdW5jdGlvbk5hbWVEZWNsYXJhdGlvbihub2RlLm5hbWUpKVxuICAgICAgICAuZmluaXNoKG5vZGUsIFNjb3BlVHlwZS5GVU5DVElPTl9OQU1FKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICByZWR1Y2VHZXR0ZXIobm9kZSwgbmFtZSwgYm9keSkge1xuICAgIHJldHVybiBib2R5LmZpbmlzaChub2RlLCBTY29wZVR5cGUuRlVOQ1RJT04pO1xuICB9XG5cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZSwgaWRlbnRpZmllcikge1xuICAgIHJldHVybiB0aGlzLmlkZW50aXR5LmFkZFJlZmVyZW5jZShuZXcgUmVhZFJlZmVyZW5jZShub2RlLmlkZW50aWZpZXIpKTtcbiAgfVxuXG4gIHJlZHVjZVBvc3RmaXhFeHByZXNzaW9uKG5vZGUsIG9wZXJhbmQpIHtcbiAgICBpZiAobm9kZS5vcGVyYW5kLnR5cGUgPT09IFwiSWRlbnRpZmllckV4cHJlc3Npb25cIikge1xuICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuYWRkUmVmZXJlbmNlKG5ldyBSZWFkV3JpdGVSZWZlcmVuY2Uobm9kZS5vcGVyYW5kLmlkZW50aWZpZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9wZXJhbmQ7XG4gIH1cblxuICByZWR1Y2VQcmVmaXhFeHByZXNzaW9uKG5vZGUsIG9wZXJhbmQpIHtcbiAgICBpZiAoKG5vZGUub3BlcmF0b3IgPT09IFwiLS1cIiB8fCBub2RlLm9wZXJhdG9yID09PSBcIisrXCIpICYmIG5vZGUub3BlcmFuZC50eXBlID09PSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmlkZW50aXR5LmFkZFJlZmVyZW5jZShuZXcgUmVhZFdyaXRlUmVmZXJlbmNlKG5vZGUub3BlcmFuZC5pZGVudGlmaWVyKSk7XG4gICAgfVxuICAgIHJldHVybiBvcGVyYW5kO1xuICB9XG5cbiAgcmVkdWNlU2NyaXB0KG5vZGUsIGJvZHkpIHtcbiAgICByZXR1cm4gYm9keS5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkdMT0JBTCk7XG4gIH1cblxuICByZWR1Y2VTZXR0ZXIobm9kZSwgbmFtZSwgcGFyYW1ldGVyLCBib2R5KSB7XG4gICAgcmV0dXJuIGJvZHkuYWRkRGVjbGFyYXRpb24obmV3IFBhcmFtZXRlckRlY2xhcmF0aW9uKG5vZGUucGFyYW1ldGVyKSlcbiAgICAgIC5maW5pc2gobm9kZSwgU2NvcGVUeXBlLkZVTkNUSU9OKTtcbiAgfVxuXG4gIHJlZHVjZVZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSwgZGVjbGFyYXRvcnMpIHtcbiAgICByZXR1cm4gbm9kZS5kZWNsYXJhdG9ycy5yZWR1Y2UoXG4gICAgICAocywgZCkgPT4gcy5hZGREZWNsYXJhdGlvbihEZWNsYXJhdGlvbi5mcm9tVmFyRGVjbEtpbmQoZC5iaW5kaW5nLCBub2RlLmtpbmQpKSxcbiAgICAgIHN1cGVyLnJlZHVjZVZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSwgZGVjbGFyYXRvcnMpXG4gICAgKTtcbiAgfVxuXG4gIHJlZHVjZVZhcmlhYmxlRGVjbGFyYXRvcihub2RlLCBiaW5kaW5nLCBpbml0KSB7XG4gICAgbGV0IHMgPSBzdXBlci5yZWR1Y2VWYXJpYWJsZURlY2xhcmF0b3Iobm9kZSwgYmluZGluZywgaW5pdCk7XG4gICAgaWYgKGluaXQgIT0gbnVsbCkge1xuICAgICAgcyA9IHMuYWRkUmVmZXJlbmNlKG5ldyBXcml0ZVJlZmVyZW5jZShub2RlLmJpbmRpbmcpKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICByZWR1Y2VXaXRoU3RhdGVtZW50KG5vZGUsIG9iamVjdCwgYm9keSkge1xuICAgIHJldHVybiBzdXBlci5yZWR1Y2VXaXRoU3RhdGVtZW50KG5vZGUsIG9iamVjdCwgYm9keS5maW5pc2gobm9kZSwgU2NvcGVUeXBlLldJVEgpKTtcbiAgfVxufVxuIl19