/**
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

const MultiMap = require('multimap');
const { reduce, MonoidalReducer } = require('shift-reducer');
const ScopeState = require('./scope-state');
const { Accessibility, Reference } = require('./reference');
const { DeclarationType } = require('./declaration');
const { ScopeType } = require('./scope');
const StrictnessReducer = require('./strictness-reducer');

function asSimpleFunctionDeclarationName(statement) {
  return statement.type === 'FunctionDeclaration' && !statement.isGenerator && !statement.isAsync
    ? statement.name
    : statement.type === 'LabeledStatement'
      ? asSimpleFunctionDeclarationName(statement.body)
      : null;
}

function getUnnestedSimpleFunctionDeclarationNames(statements) {
  let names = statements.map(asSimpleFunctionDeclarationName).filter(f => f != null);
  // if a function declaration occurs twice in the same scope, neither can be B.3.3 hoisted
  // see https://github.com/tc39/ecma262/issues/913

  let hist = names.reduce((memo, id) => {
    if (id.name in memo) {
      ++memo[id.name];
    } else {
      memo[id.name] = 1;
    }
    return memo;
  }, Object.create(null));
  return names.filter(id => hist[id.name] === 1);
}

module.exports = class ScopeAnalyzer extends MonoidalReducer {
  constructor(program) {
    super(ScopeState);
    this.sloppySet = program.type === 'Script' ? StrictnessReducer.analyze(program) : new Set;
  }

  fold(list, a) {
    return list.reduce((memo, x) => this.append(memo, x), a == null ? this.identity : a);
  }

  static analyze(program) {
    return reduce(new this(program), program).children[0];
  }

  finishFunction(fnNode, params, body) {
    const isArrowFn = fnNode.type === 'ArrowExpression';
    const fnType = isArrowFn ? ScopeType.ARROW_FUNCTION : ScopeType.FUNCTION;
    if (params.hasParameterExpressions) {
      return params
        .withoutParameterExpressions()
        .concat(body.finish(fnNode, fnType, { shouldResolveArguments: false, paramsToBlockB33Hoisting: params, shouldB33: this.sloppySet.has(fnNode) }))
        .finish(fnNode, ScopeType.PARAMETERS, { shouldResolveArguments: !isArrowFn });
    }
    return params.concat(body).finish(fnNode, fnType, { shouldResolveArguments: !isArrowFn, shouldB33: this.sloppySet.has(fnNode) });
  }

  reduceArrowExpression(node, { params, body }) {
    return this.finishFunction(node, params, body);
  }

  reduceAssignmentExpression(node, { binding, expression }) {
    return super.reduceAssignmentExpression(node, {
      binding: binding.addReferences(Accessibility.WRITE),
      expression,
    });
  }

  reduceAssignmentTargetIdentifier(node) {
    return new ScopeState({ atsForParent: [node] });
  }

  reduceBindingIdentifier(node) {
    if (node.name === '*default*') {
      return new ScopeState;
    }
    return new ScopeState({ bindingsForParent: [node] });
  }

  reduceBindingPropertyIdentifier(node, { binding, init }) {
    const s = super.reduceBindingPropertyIdentifier(node, { binding, init });
    if (init) {
      return s.withParameterExpressions();
    }
    return s;
  }

  reduceBindingPropertyProperty(node, { name, binding }) {
    const s = super.reduceBindingPropertyProperty(node, { name, binding });
    if (node.name.type === 'ComputedPropertyName') {
      return s.withParameterExpressions();
    }
    return s;
  }

  reduceBindingWithDefault(node, { binding, init }) {
    return super.reduceBindingWithDefault(node, { binding, init }).withParameterExpressions();
  }

  reduceBlock(node, { statements }) {
    return super
      .reduceBlock(node, { statements })
      .withPotentialVarFunctions(getUnnestedSimpleFunctionDeclarationNames(node.statements))
      .finish(node, ScopeType.BLOCK);
  }

  reduceCallExpression(node, { callee, arguments: _arguments }) {
    const s = super.reduceCallExpression(node, { callee, arguments: _arguments });
    if (node.callee.type === 'IdentifierExpression' && node.callee.name === 'eval') {
      return s.taint();
    }
    return s;
  }

  reduceCatchClause(node, { binding, body }) {
    return super
      .reduceCatchClause(node, {
        binding: binding == null ? null : binding.addDeclarations(DeclarationType.CATCH_PARAMETER),
        body,
      })
      .finish(node, ScopeType.CATCH);
  }

  reduceClassDeclaration(node, { name, super: _super, elements }) {
    let s = super
      .reduceClassDeclaration(node, { name, super: _super, elements })
      .addDeclarations(DeclarationType.CLASS_NAME)
      .finish(node, ScopeType.CLASS_NAME);
    return s.concat(name.addDeclarations(DeclarationType.CLASS_DECLARATION));
  }

  reduceClassExpression(node, { name, super: _super, elements }) {
    return super
      .reduceClassExpression(node, { name, super: _super, elements })
      .addDeclarations(DeclarationType.CLASS_NAME)
      .finish(node, ScopeType.CLASS_NAME);
  }

  reduceCompoundAssignmentExpression(node, { binding, expression }) {
    return super.reduceCompoundAssignmentExpression(node, {
      binding: binding.addReferences(Accessibility.READWRITE),
      expression,
    });
  }

  reduceComputedMemberExpression(node, { object, expression }) {
    return super
      .reduceComputedMemberExpression(node, { object, expression })
      .withParameterExpressions();
  }

  reduceForInStatement(node, { left, right, body }) {
    return super
      .reduceForInStatement(node, { left: left.addReferences(Accessibility.WRITE), right, body })
      .finish(node, ScopeType.BLOCK);
  }

  reduceForAwaitStatement(node, { left, right, body }) {
    return super
      .reduceForAwaitStatement(node, { left: left.addReferences(Accessibility.WRITE), right, body })
      .finish(node, ScopeType.BLOCK);
  }

  reduceForOfStatement(node, { left, right, body }) {
    return super
      .reduceForOfStatement(node, { left: left.addReferences(Accessibility.WRITE), right, body })
      .finish(node, ScopeType.BLOCK);
  }

  reduceForStatement(node, { init, test, update, body }) {
    return super
      .reduceForStatement(node, {
        init: init ? init.withoutBindingsForParent() : init,
        test,
        update,
        body,
      })
      .finish(node, ScopeType.BLOCK);
  }

  reduceFormalParameters(node, { items, rest }) {
    let s = rest ? rest : new ScopeState;
    items.forEach((item, ind) => {
      s = s.concat(
        item.hasParameterExpressions
          ? item.finish(node.items[ind], ScopeType.PARAMETER_EXPRESSION)
          : item
      );
    });
    return s.addDeclarations(DeclarationType.PARAMETER);
  }

  reduceFunctionDeclaration(node, { name, params, body }) {
    return name.concat(this.finishFunction(node, params, body)).addFunctionDeclaration();
  }

  reduceFunctionExpression(node, { name, params, body }) {
    let s = this.finishFunction(node, params, body);
    if (name) {
      return name
        .concat(s)
        .addDeclarations(DeclarationType.FUNCTION_NAME)
        .finish(node, ScopeType.FUNCTION_NAME);
    }
    return s;
  }

  reduceGetter(node, { name, body }) {
    return name.concat(
      body.finish(node, ScopeType.FUNCTION, {
        shouldResolveArguments: true,
        shouldB33: this.sloppySet.has(node),
      })
    );
  }

  reduceIdentifierExpression(node) {
    return new ScopeState({
      freeIdentifiers: new MultiMap([[node.name, new Reference(node, Accessibility.READ)]]),
    });
  }

  reduceIfStatement(node, { test, consequent, alternate }) {
    // These "blocks" are synthetic; see https://tc39.es/ecma262/#sec-functiondeclarations-in-ifstatement-statement-clauses
    let consequentFunctionDeclName = asSimpleFunctionDeclarationName(node.consequent);
    if (consequentFunctionDeclName != null) {
      consequent = consequent.withPotentialVarFunctions([consequentFunctionDeclName])
        .finish(node.consequent, ScopeType.BLOCK);
    }
    if (node.alternate != null) {
      let alternateFunctionDeclName = asSimpleFunctionDeclarationName(node.alternate);
      if (alternateFunctionDeclName != null) {
        alternate = alternate.withPotentialVarFunctions([alternateFunctionDeclName])
          .finish(node.alternate, ScopeType.BLOCK);
      }
    }
    return super
      .reduceIfStatement(node, { test, consequent, alternate });
  }

  reduceImport(node, { moduleSpecifier, defaultBinding, namedImports }) {
    return super
      .reduceImport(node, { moduleSpecifier, defaultBinding, namedImports })
      .addDeclarations(DeclarationType.IMPORT);
  }

  reduceMethod(node, { name, params, body }) {
    return name.concat(this.finishFunction(node, params, body));
  }

  reduceModule(node, { directives, items }) {
    return super.reduceModule(node, { directives, items }).finish(node, ScopeType.MODULE);
  }

  reduceScript(node, { directives, statements }) {
    return super.reduceScript(node, { directives, statements }).finish(node, ScopeType.SCRIPT, { shouldB33: !node.directives.some(d => d.rawValue === 'use strict') });
  }

  reduceSetter(node, { name, param, body }) {
    if (param.hasParameterExpressions) {
      param = param.finish(node, ScopeType.PARAMETER_EXPRESSION);
    }
    return name.concat(
      this.finishFunction(node, param.addDeclarations(DeclarationType.PARAMETER), body)
    );
  }

  reduceSwitchStatement(node, { discriminant, cases }) {
    return this
      .fold(cases)
      .withPotentialVarFunctions(getUnnestedSimpleFunctionDeclarationNames([].concat(...node.cases.map(c => c.consequent))))
      .finish(node, ScopeType.BLOCK)
      .concat(discriminant);
  }

  reduceSwitchStatementWithDefault(node, { discriminant, preDefaultCases, defaultCase, postDefaultCases }) {
    const functionDeclarations = getUnnestedSimpleFunctionDeclarationNames([].concat(
      ...node.preDefaultCases.concat([node.defaultCase], node.postDefaultCases).map(c => c.consequent)
    ));
    const cases = preDefaultCases.concat([defaultCase], postDefaultCases);
    return this
      .fold(cases)
      .withPotentialVarFunctions(functionDeclarations)
      .finish(node, ScopeType.BLOCK)
      .concat(discriminant);
  }

  reduceUnaryExpression(node, { operand }) {
    if (node.operator === 'delete' && node.operand.type === 'IdentifierExpression') {
      // 'delete x' is a special case.
      return new ScopeState({ freeIdentifiers: new MultiMap([[node.operand.name, new Reference(node.operand, Accessibility.DELETE)]]) });
    }
    return super.reduceUnaryExpression(node, { operand });
  }

  reduceUpdateExpression(node, { operand }) {
    return operand.addReferences(Accessibility.READWRITE);
  }

  reduceVariableDeclaration(node, { declarators }) {
    return super
      .reduceVariableDeclaration(node, { declarators })
      .addDeclarations(DeclarationType.fromVarDeclKind(node.kind), true);
    // passes bindingsForParent up, for for-in and for-of to add their write-references
  }

  reduceVariableDeclarationStatement(node, { declaration }) {
    return declaration.withoutBindingsForParent();
  }

  reduceVariableDeclarator(node, { binding, init }) {
    const s = super.reduceVariableDeclarator(node, { binding, init });
    if (init) {
      return s.addReferences(Accessibility.WRITE, true);
    }
    return s;
  }

  reduceWithStatement(node, { object, body }) {
    return super.reduceWithStatement(node, { object, body: body.finish(node, ScopeType.WITH) });
  }
};
