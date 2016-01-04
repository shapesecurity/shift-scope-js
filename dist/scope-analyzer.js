"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _multimap = require("multimap");

var _MultiMap = _interopRequireWildcard(_multimap);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _scopeState = require("./scope-state");

var _scopeState2 = _interopRequireDefault(_scopeState);

var _reference = require("./reference");

var _declaration = require("./declaration");

var _scope = require("./scope");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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

var MultiMap = _MultiMap.default; // (babel) TODO remove this

var reduce = _shiftReducer2.default.default; // (babel) TODO remove this

function finishFunction(fnNode, params, body) {
  var isArrowFn = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

  var fnType = isArrowFn ? _scope.ScopeType.ARROW_FUNCTION : _scope.ScopeType.FUNCTION;
  if (params.hasParameterExpressions) {
    return params.withoutParameterExpressions().concat(body.finish(fnNode, fnType, !isArrowFn)).finish(fnNode, _scope.ScopeType.PARAMETERS);
  } else {
    return params.concat(body).finish(fnNode, fnType, !isArrowFn);
  }
}

function getFunctionDeclarations(statements) {
  // returns the binding identifiers of function declarations in the list of statements
  return statements.filter(function (s) {
    return s.type === "FunctionDeclaration";
  }).map(function (f) {
    return f.name;
  });
}

var ScopeAnalyzer = (function (_MonoidalReducer) {
  _inherits(ScopeAnalyzer, _MonoidalReducer);

  function ScopeAnalyzer() {
    _classCallCheck(this, ScopeAnalyzer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScopeAnalyzer).call(this, _scopeState2.default));
  }

  _createClass(ScopeAnalyzer, [{
    key: "reduceArrowExpression",
    value: function reduceArrowExpression(node, _ref) {
      var params = _ref.params;
      var body = _ref.body;

      return finishFunction(node, params, body, true);
    }
  }, {
    key: "reduceAssignmentExpression",
    value: function reduceAssignmentExpression(node, _ref2) {
      var binding = _ref2.binding;
      var expression = _ref2.expression;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceAssignmentExpression", this).call(this, node, { binding: binding.addReferences(_reference.Accessibility.WRITE), expression: expression });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node) {
      return new _scopeState2.default({ bindingsForParent: [node] });
    }
  }, {
    key: "reduceBindingPropertyIdentifier",
    value: function reduceBindingPropertyIdentifier(node, _ref3) {
      var binding = _ref3.binding;
      var init = _ref3.init;

      var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceBindingPropertyIdentifier", this).call(this, node, { binding: binding, init: init });
      if (init) {
        return s.withParameterExpressions();
      }
      return s;
    }
  }, {
    key: "reduceBindingWithDefault",
    value: function reduceBindingWithDefault(node, _ref4) {
      var binding = _ref4.binding;
      var init = _ref4.init;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceBindingWithDefault", this).call(this, node, { binding: binding, init: init }).withParameterExpressions();
    }
  }, {
    key: "reduceBlock",
    value: function reduceBlock(node, _ref5) {
      var statements = _ref5.statements;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceBlock", this).call(this, node, { statements: statements }).withPotentialVarFunctions(getFunctionDeclarations(node.statements)).finish(node, _scope.ScopeType.BLOCK);
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node, _ref6) {
      var callee = _ref6.callee;
      var _arguments = _ref6.arguments;

      var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceCallExpression", this).call(this, node, { callee: callee, arguments: _arguments });
      if (node.callee.type === "IdentifierExpression" && node.callee.name === "eval") {
        return s.taint();
      }
      return s;
    }
  }, {
    key: "reduceCatchClause",
    value: function reduceCatchClause(node, _ref7) {
      var binding = _ref7.binding;
      var body = _ref7.body;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceCatchClause", this).call(this, node, { binding: binding.addDeclarations(_declaration.DeclarationType.CATCH_PARAMETER), body: body }).finish(node, _scope.ScopeType.CATCH);
    }
  }, {
    key: "reduceClassDeclaration",
    value: function reduceClassDeclaration(node, _ref8) {
      var name = _ref8.name;
      var _super = _ref8.super;
      var elements = _ref8.elements;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceClassDeclaration", this).call(this, node, { name: name.addDeclarations(_declaration.DeclarationType.CLASS_NAME), super: _super, elements: elements });
    }
  }, {
    key: "reduceClassExpression",
    value: function reduceClassExpression(node, _ref9) {
      var name = _ref9.name;
      var _super = _ref9.super;
      var elements = _ref9.elements;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceClassExpression", this).call(this, node, { name: name, super: _super, elements: elements }).addDeclarations(_declaration.DeclarationType.CLASS_NAME).finish(node, _scope.ScopeType.CLASS_NAME);
    }
  }, {
    key: "reduceCompoundAssignmentExpression",
    value: function reduceCompoundAssignmentExpression(node, _ref10) {
      var binding = _ref10.binding;
      var expression = _ref10.expression;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceCompoundAssignmentExpression", this).call(this, node, { binding: binding.addReferences(_reference.Accessibility.READWRITE), expression: expression });
    }
  }, {
    key: "reduceComputedMemberExpression",
    value: function reduceComputedMemberExpression(node, _ref11) {
      var object = _ref11.object;
      var expression = _ref11.expression;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceComputedMemberExpression", this).call(this, node, { object: object, expression: expression }).withParameterExpressions();
    }
  }, {
    key: "reduceForInStatement",
    value: function reduceForInStatement(node, _ref12) {
      var left = _ref12.left;
      var right = _ref12.right;
      var body = _ref12.body;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForInStatement", this).call(this, node, { left: left.addReferences(_reference.Accessibility.WRITE), right: right, body: body }).finish(node, _scope.ScopeType.BLOCK);
    }
  }, {
    key: "reduceForOfStatement",
    value: function reduceForOfStatement(node, _ref13) {
      var left = _ref13.left;
      var right = _ref13.right;
      var body = _ref13.body;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForOfStatement", this).call(this, node, { left: left.addReferences(_reference.Accessibility.WRITE), right: right, body: body }).finish(node, _scope.ScopeType.BLOCK);
    }
  }, {
    key: "reduceForStatement",
    value: function reduceForStatement(node, _ref14) {
      var init = _ref14.init;
      var test = _ref14.test;
      var update = _ref14.update;
      var body = _ref14.body;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceForStatement", this).call(this, node, { init: init ? init.withoutBindingsForParent() : init, test: test, update: update, body: body }).finish(node, _scope.ScopeType.BLOCK);
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node, _ref15) {
      var items = _ref15.items;
      var rest = _ref15.rest;

      var s = rest ? rest : new _scopeState2.default();
      items.forEach(function (item, ind) {
        return s = s.concat(item.hasParameterExpressions ? item.finish(node.items[ind], _scope.ScopeType.PARAMETER_EXPRESSION) : item);
      });
      return s.addDeclarations(_declaration.DeclarationType.PARAMETER);
    }
  }, {
    key: "reduceFunctionDeclaration",
    value: function reduceFunctionDeclaration(node, _ref16) {
      var name = _ref16.name;
      var params = _ref16.params;
      var body = _ref16.body;

      return name.concat(finishFunction(node, params, body)).addFunctionDeclaration();
    }
  }, {
    key: "reduceFunctionExpression",
    value: function reduceFunctionExpression(node, _ref17) {
      var name = _ref17.name;
      var params = _ref17.params;
      var body = _ref17.body;

      var s = finishFunction(node, params, body);
      if (name) {
        return name.concat(s).addDeclarations(_declaration.DeclarationType.FUNCTION_NAME).finish(node, _scope.ScopeType.FUNCTION_NAME);
      }
      return s;
    }
  }, {
    key: "reduceGetter",
    value: function reduceGetter(node, _ref18) {
      var name = _ref18.name;
      var body = _ref18.body;

      // todo test order
      return name.concat(body.finish(node, _scope.ScopeType.FUNCTION, true));
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node) {
      return new _scopeState2.default({ freeIdentifiers: new MultiMap([[node.name, new _reference.ReadReference(node)]]) });
    }
  }, {
    key: "reduceIfStatement",
    value: function reduceIfStatement(node, _ref19) {
      var test = _ref19.test;
      var consequent = _ref19.consequent;
      var alternate = _ref19.alternate;

      var pvsfd = [];
      if (node.consequent.type === "FunctionDeclaration") {
        pvsfd.push(node.consequent.name);
      }
      if (node.alternate && node.alternate.type === "FunctionDeclaration") {
        pvsfd.push(node.alternate.name);
      }
      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceIfStatement", this).call(this, node, { test: test, consequent: consequent, alternate: alternate }).withPotentialVarFunctions(pvsfd);
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node, _ref20) {
      var moduleSpecifier = _ref20.moduleSpecifier;
      var defaultBinding = _ref20.defaultBinding;
      var namedImports = _ref20.namedImports;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceImport", this).call(this, node, { moduleSpecifier: moduleSpecifier, defaultBinding: defaultBinding, namedImports: namedImports }).addDeclarations(_declaration.DeclarationType.IMPORT);
    }
  }, {
    key: "reduceMethod",
    value: function reduceMethod(node, _ref21) {
      var name = _ref21.name;
      var params = _ref21.params;
      var body = _ref21.body;

      // todo test order
      return name.concat(finishFunction(node, params, body));
    }
  }, {
    key: "reduceModule",
    value: function reduceModule(node, _ref22) {
      var directives = _ref22.directives;
      var items = _ref22.items;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceModule", this).call(this, node, { directives: directives, items: items }).finish(node, _scope.ScopeType.MODULE);
    }
  }, {
    key: "reduceScript",
    value: function reduceScript(node, _ref23) {
      var directives = _ref23.directives;
      var statements = _ref23.statements;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceScript", this).call(this, node, { directives: directives, statements: statements }).finish(node, _scope.ScopeType.SCRIPT);
    }
  }, {
    key: "reduceSetter",
    value: function reduceSetter(node, _ref24) {
      var name = _ref24.name;
      var param = _ref24.param;
      var body = _ref24.body;

      // todo test order
      if (param.hasParameterExpressions) {
        param = param.finish(node, _scope.ScopeType.PARAMETER_EXPRESSION);
      }
      return name.concat(finishFunction(node, param.addDeclarations(_declaration.DeclarationType.PARAMETER), body));
    }
  }, {
    key: "reduceSwitchCase",
    value: function reduceSwitchCase(node, _ref25) {
      var test = _ref25.test;
      var consequent = _ref25.consequent;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceSwitchCase", this).call(this, node, { test: test, consequent: consequent }).finish(node, _scope.ScopeType.BLOCK).withPotentialVarFunctions(getFunctionDeclarations(node.consequent));
    }
  }, {
    key: "reduceSwitchDefault",
    value: function reduceSwitchDefault(node, _ref26) {
      var consequent = _ref26.consequent;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceSwitchDefault", this).call(this, node, { consequent: consequent }).finish(node, _scope.ScopeType.BLOCK).withPotentialVarFunctions(getFunctionDeclarations(node.consequent));
    }
  }, {
    key: "reduceUpdateExpression",
    value: function reduceUpdateExpression(node, _ref27) {
      var operand = _ref27.operand;

      return operand.addReferences(_reference.Accessibility.READWRITE);
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node, _ref28) {
      var declarators = _ref28.declarators;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceVariableDeclaration", this).call(this, node, { declarators: declarators }).addDeclarations(_declaration.DeclarationType.fromVarDeclKind(node.kind), true);
      // passes bindingsForParent up, for for-in and for-of to add their write-references
    }
  }, {
    key: "reduceVariableDeclarationStatement",
    value: function reduceVariableDeclarationStatement(node, _ref29) {
      var declaration = _ref29.declaration;

      return declaration.withoutBindingsForParent();
    }
  }, {
    key: "reduceVariableDeclarator",
    value: function reduceVariableDeclarator(node, _ref30) {
      var binding = _ref30.binding;
      var init = _ref30.init;

      var s = _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceVariableDeclarator", this).call(this, node, { binding: binding, init: init });
      if (init) {
        return s.addReferences(_reference.Accessibility.WRITE, true);
      }
      return s;
    }
  }, {
    key: "reduceWithStatement",
    value: function reduceWithStatement(node, _ref31) {
      var object = _ref31.object;
      var body = _ref31.body;

      return _get(Object.getPrototypeOf(ScopeAnalyzer.prototype), "reduceWithStatement", this).call(this, node, { object: object, body: body.finish(node, _scope.ScopeType.WITH) });
    }
  }], [{
    key: "analyze",
    value: function analyze(program) {
      return reduce(new this(), program).children[0];
    }
  }]);

  return ScopeAnalyzer;
})(_shiftReducer.MonoidalReducer);

exports.default = ScopeAnalyzer;