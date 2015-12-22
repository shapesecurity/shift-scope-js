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

import _reduce, {MonoidalReducer} from "shift-reducer";
const reduce = _reduce.default; // (babel) TODO remove this
import ScopeState from "./scope-state";
import {Accessibility, ReadReference} from "./reference";
import {Declaration, DeclarationType} from "./declaration";
import {ScopeType} from "./scope";

function finishFunction(fnNode, params, body, isArrowFn = false) {
  const fnType = isArrowFn ? ScopeType.ARROW_FUNCTION : ScopeType.FUNCTION;
  if (params.hasParameterExpressions) {
    return params.withoutParameterExpressions()
      .concat(body.finish(fnNode, fnType))
      .addDeclarations(DeclarationType.PARAMETER)
      .finish(fnNode, ScopeType.PARAMETERS, !isArrowFn);
  } else {
    return params.addDeclarations(DeclarationType.PARAMETER)
      .concat(body)
      .finish(fnNode, fnType);
  }
}

function getFunctionDeclarations(statements) {
  // returns the binding identifiers of function declarations in the list of statements
  return statements.filter(s => s.type === "FunctionDeclaration").map(f => f.name);
}

export default class ScopeAnalyzer extends MonoidalReducer {

  constructor() {
    super(ScopeState);
  }

  static analyze(program) {
    return reduce(new this, program).children[0];
  }

  reduceArrowExpression(node, {params, body}) {
    return finishFunction(node, params, body, true);
  }

  reduceAssignmentExpression(node, {binding, expression}) {
    return super.reduceAssignmentExpression(node, {binding: binding.addReferences(Accessibility.WRITE), expression});
  }

  reduceBindingIdentifier(node) {
    return new ScopeState({bindingsForParent: [node]});
  }

  reduceBindingPropertyIdentifier(node, {binding, init}) {
    const s = super.reduceBindingPropertyIdentifier(node, {binding, init});
    if (init) {
      return s.withParameterExpressions();
    }
    return s;
  }

  reduceBindingWithDefault(node, {binding, init}) {
    return super.reduceBindingWithDefault(node, {binding, init}).withParameterExpressions();
  }

  reduceBlock(node, {statements}) {
    return super.reduceBlock(node, {statements})
      .withPotentialVarFunctions(getFunctionDeclarations(node.statements))
      .finish(node, ScopeType.BLOCK);
  }

  reduceCallExpression(node, {callee, _arguments}) {
    const s = super.reduceCallExpression(node, {callee, arguments: _arguments});
    if (node.callee.type === "IdentifierExpression" && node.callee.name === "eval") {
      return s.taint();
    }
    return s;
  }

  reduceCatchClause(node, {param, body}) {
    return super.reduceCatchClause(node, {param: param.addDeclarations(DeclarationType.CATCH_PARAMETER), body}).finish(node, ScopeType.CATCH);
  }

  reduceClassDeclaration(node, {name, _super, elements}) {
    return super.reduceClassDeclaration(node, {name: name.addDeclarations(DeclarationType.CLASS_NAME), super: _super, elements});
  }

  reduceClassExpression(node, {name, _super, elements}) {
    return super.reduceClassExpression(node, {name, super: _super, elements}).addDeclarations(DeclarationType.CLASS_NAME).finish(node, ScopeType.CLASS_NAME);
  }

  reduceCompoundAssignmentExpression(node, {binding, expression}) {
    return super.reduceCompoundAssignmentExpression(node, {binding: binding.addReferences(Accessibility.READWRITE), expression});
  }

  reduceComputedMemberExpression(node, {expression, object}) {
    return super.reduceComputedMemberExpression(node, {object, expression}).withParameterExpressions();
  }

  reduceComputedMemberExpression(node, {expression, object}) {
    return super.reduceComputedMemberExpression(node, {object, expression}).withParameterExpressions();
  }

  reduceForInStatement(node, {left, right, body}) {
    return super.reduceForInStatement(node, {left: left.addReferences(Accessibility.WRITE), right, body}).finish(node, ScopeType.BLOCK);
  }

  reduceForOfStatement(node, {left, right, body}) {
    return super.reduceForOfStatement(node, {left: left.addReferences(Accessibility.WRITE), right, body}).finish(node, ScopeType.BLOCK);
  }

  reduceForStatement(node, {init, test, update, body}) {
    return super.reduceForStatement(node, {init: init ? init.withoutBindingsForParent() : init, test, update, body}).finish(node, ScopeType.BLOCK);
  }

  reduceFormalParameters(node, {items, rest}) {
    let s = rest ? rest : new ScopeState();
    items.forEach((item, ind) => s = s.concat(item.hasParameterExpressions ? item.finish(node.items[ind], ScopeType.PARAMETER_EXPRESSION) : item));
    return s.addDeclarations(DeclarationType.PARAMETER);
  }

  reduceFunctionDeclaration(node, {name, params, body}) {
    return name.concat(finishFunction(node, params, body)).addFunctionDeclaration();
  }

  reduceFunctionExpresion(node, {name, params, body}) {
    let s = finishFunction(node, params, body);
    if (name) {
      return name.concat(s).addDeclarations(DeclarationType.FUNCTION_NAME).finish(node, ScopeType.FUNCTION_NAME);
    }
    return s;
  }

  reduceGetter(node, {name, body}) {
    // todo test order
    return name.concat(body.finish(node, ScopeType.Function, true));
  }

  reduceIdentifierExpression(node) {
    return new ScopeState({freeIdentifiers: [new ReadReference(node)]});
  }

  reduceIfStatement(node, {test, consequent, alternate}) {
    const statements = node.consequent.concat(node.alternate ? node.alternate : []);
    return super.reduceIfStatement(node, {test, consequent, alternate}).withPotentialVarFunctions(getFunctionDeclarations(statements));
  }

  reduceMethod(node, {name, params, body}) {
    // todo test order
    return name.concat(finishFunction(node, params, body));
  }

  reduceModule(node, {directives, statements}) {
    return super.reduceModule(node, {directives, statements}).finish(node, ScopeType.MODULE);
  }

  reduceScript(node, {directives, statements}) {
    return super.reduceScript(node, {directives, statements}).finish(node, ScopeType.SCRIPT);
  }

  reduceSetter(node, {name, param, body}) {
    // todo test order
    if (param.hasParameterExpressions) {
      param = param.finish(node, ScopeType.PARAMETER_EXPRESSION);
    }
    return name.concat(finishFunction(node, param.addDeclarations(DeclarationType.PARAMETER), body));
  }

  reduceSwitchCase(node, {test, consequent}) {
    return super.reduceSwitchCase(node, {test, consequent}).finish(node, ScopeType.BLOCK).withPotentialVarFunctions(getFunctionDeclarations(node.consequent));
  }

  reduceSwitchDefault(node, {consequent}) {
    return super.reduceSwitchDefault(node, {consequent}).finish(node, ScopeType.BLOCK).withPotentialVarFunctions(getFunctionDeclarations(node.consequent));
  }

  reduceUpdateExpression(node, {operand}) {
    return operand.addReferences(Accessibility.READWRITE);
  }

  reduceVariableDeclaration(node, {declarators}) {
    return super.reduceVariableDeclaration(node, {declarators}).addDeclarations(DeclarationType.fromVarDeclKind(node.kind), true);
    // passes bindingsForParent up, for for-in and for-of to add their write-references
  }

  reduceVariableDeclarationStatement(node, {declaration}) {
    return declaration.withoutBindingsForParent();
  }

  reduceVariableDeclarator(node, {binding, init}) {
    const s = super.reduceVariableDeclarator(node, {binding, init});
    if (init) {
      return s.addReferences(Accessibility.WRITE, true);
    }
    return s;
  }

  reduceWithStatement(node, {object, body}) {
    return super.reduceWithStatement(node, {object, body: body.finish(node, ScopeType.WITH)});
  }
}
