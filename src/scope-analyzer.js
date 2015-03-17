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

import reduce, {MonoidalReducer} from "shift-reducer";
import ScopeState from "./scope-state";
import {ReadReference, WriteReference, ReadWriteReference} from "./reference";
import {Declaration, VarDeclaration, ConstDeclaration, LetDeclaration, CatchDeclaration, ParameterDeclaration, FunctionNameDeclaration} from "./declaration";
import {ScopeType} from "./scope";

export default class ScopeAnalyzer extends MonoidalReducer {

  constructor() {
    super(ScopeState);
  }

  static analyze(script) {
    return reduce(new this, script).children[0];
  }

  reduceAssignmentExpression(node, binding, expression) {
    if (node.binding.type === "IdentifierExpression") {
      let ReferenceCtor = node.operator === "=" ? WriteReference : ReadWriteReference;
      return expression.addReference(new ReferenceCtor(node.binding.identifier));
    }
    return super.reduceAssignmentExpression(node, binding, expression);
  }

  reduceBlock(node, statements) {
    let s = super.reduceBlock(node, statements);
    if (s.blockScopedDeclarations.size > 0) {
      s = s.finish(node, ScopeType.BLOCK);
    }
    return s;
  }

  reduceCallExpression(node, callee, args) {
    let s = super.reduceCallExpression(node, callee, args);
    if (node.callee.type === "IdentifierExpression" && node.callee.identifier.name === "eval") {
      return s.taint();
    }
    return s;
  }

  reduceCatchClause(node, binding, body) {
    return super.reduceCatchClause(node, binding, body)
      .addDeclaration(new CatchDeclaration(node.binding))
      .finish(node, ScopeType.CATCH);
  }

  reduceForInStatement(node, left, right, body) {
    if (node.left.type === "VariableDeclaration") {
      let declarator = node.left.declarators[0];
      if (declarator.init == null) {
        left = left.addReference(new WriteReference(declarator.binding));
      }
      if (left.blockScopedDeclarations.size > 0) {
        return this.append(this.append(left, body).finish(node, ScopeType.BLOCK), right);
      }
      return super.reduceForInStatement(node, left, right, body);
    }
    return this.append(right, body).addReference(new WriteReference(node.left.identifier));
  }

  reduceForStatement(node, init, test, update, body) {
    let s = super.reduceForStatement(node, init, test, update, body);
    if (node.init != null && node.init.type === "VariableDeclaration" && init.blockScopedDeclarations.size > 0) {
      return s.finish(node, ScopeType.BLOCK);
    }
    return s;
  }

  reduceFunctionDeclaration(node, name, parameters, functionBody) {
    return node.parameters.reduce((s, p) => s.addDeclaration(new ParameterDeclaration(p)), functionBody)
      .finish(node, ScopeType.FUNCTION)
      .addDeclaration(new FunctionNameDeclaration(node.name));
  }

  reduceFunctionExpression(node, name, parameters, functionBody) {
    let s = node.parameters.reduce((s, p) => s.addDeclaration(new ParameterDeclaration(p)), functionBody)
      .finish(node, ScopeType.FUNCTION);
    if (name != null) {
      s = s.addDeclaration(new FunctionNameDeclaration(node.name))
        .finish(node, ScopeType.FUNCTION_NAME);
    }
    return s;
  }

  reduceGetter(node, name, body) {
    return body.finish(node, ScopeType.FUNCTION);
  }

  reduceIdentifierExpression(node, identifier) {
    return this.identity.addReference(new ReadReference(node.identifier));
  }

  reducePostfixExpression(node, operand) {
    if (node.operand.type === "IdentifierExpression") {
      return this.identity.addReference(new ReadWriteReference(node.operand.identifier));
    }
    return operand;
  }

  reducePrefixExpression(node, operand) {
    if ((node.operator === "--" || node.operator === "++") && node.operand.type === "IdentifierExpression") {
      return this.identity.addReference(new ReadWriteReference(node.operand.identifier));
    }
    return operand;
  }

  reduceScript(node, body) {
    return body.finish(node, ScopeType.GLOBAL);
  }

  reduceSetter(node, name, parameter, body) {
    return body.addDeclaration(new ParameterDeclaration(node.parameter))
      .finish(node, ScopeType.FUNCTION);
  }

  reduceVariableDeclaration(node, declarators) {
    return node.declarators.reduce(
      (s, d) => s.addDeclaration(Declaration.fromVarDeclKind(d.binding, node.kind)),
      super.reduceVariableDeclaration(node, declarators)
    );
  }

  reduceVariableDeclarator(node, binding, init) {
    let s = super.reduceVariableDeclarator(node, binding, init);
    if (init != null) {
      s = s.addReference(new WriteReference(node.binding));
    }
    return s;
  }

  reduceWithStatement(node, object, body) {
    return super.reduceWithStatement(node, object, body.finish(node, ScopeType.WITH));
  }
}
