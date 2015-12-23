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

import MultiMap from "multimap";
import {Declaration, DeclarationType} from "./declaration";
import {Reference} from "./reference";

function merge(multiMap, otherMultiMap) {
  otherMultiMap.forEachEntry((v, k) => {
    multiMap.set.apply(multiMap, [k].concat(v));
  });
  return multiMap;
}

import {Scope, GlobalScope, ScopeType} from "./scope";
import Variable from "./variable";

function resolveArguments(freeIdentifiers, variables) { // todo
  let args = freeIdentifiers.get("arguments") || [];
  freeIdentifiers.delete("arguments");
  return variables.concat(new Variable("arguments", args, []));
}

function resolveDeclarations(freeIdentifiers, decls, variables) { // todo
  decls.forEachEntry((declarations, name) => {
    let references = freeIdentifiers.get(name) || [];
    variables = variables.concat(new Variable(name, references, declarations));
    freeIdentifiers.delete(name);
  });
  return variables;  // todo just modify variables in place?
}

export default class ScopeState {
  constructor({
    freeIdentifiers = new MultiMap,
    functionScopedDeclarations = new MultiMap,
    blockScopedDeclarations = new MultiMap,
    functionDeclarations = new MultiMap, // function declarations are special: they are lexical in blocks and var-scoped at the top level of functions and scripts.
    children = [],
    dynamic = false,
    bindingsForParent = [], //  either references bubbling up to the AssignmentExpression, ForOfStatement, or ForInStatement which writes to them or declarations bubbling up to the VariableDeclaration, FunctionDeclaration, ClassDeclaration, FormalParameters, Setter, Method, or CatchClause which declares them
    potentiallyVarScopedFunctionDeclarations = new MultiMap, // for B.3.3.
    hasParameterExpressions = false,
  } = {}) {
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

  static empty() {
    return new ScopeState({});
  }

  /*
   * Monoidal append: merges the two states together
   */
  concat(b) {
    if (this === b) {
      return this;
    }
    return new ScopeState({
      freeIdentifiers: merge(merge(new MultiMap, this.freeIdentifiers), b.freeIdentifiers),
      functionScopedDeclarations: merge(merge(new MultiMap, this.functionScopedDeclarations), b.functionScopedDeclarations),
      blockScopedDeclarations: merge(merge(new MultiMap, this.blockScopedDeclarations), b.blockScopedDeclarations),
      functionDeclarations: merge(merge(new MultiMap, this.functionDeclarations), b.functionDeclarations),
      children: this.children.concat(b.children),
      dynamic: this.dynamic || b.dynamic,
      bindingsForParent : this.bindingsForParent.concat(b.bindingsForParent),
      potentiallyVarScopedFunctionDeclarations: merge(merge(new MultiMap, this.potentiallyVarScopedFunctionDeclarations), b.potentiallyVarScopedFunctionDeclarations),
      hasParameterExpressions: this.hasParameterExpressions || b.hasParameterExpressions,
    });
  }

  /*
   * Observe variables entering scope
   */
  addDeclarations(kind, keepBindingsForParent = false) {
    let declMap = new MultiMap;
    merge(declMap, kind.isBlockScoped ? this.blockScopedDeclarations : this.functionScopedDeclarations);
    this.bindingsForParent.forEach(binding => declMap.set(binding.name, new Declaration(binding, kind)));
    let s = new ScopeState(this);
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

  addFunctionDeclaration() {
    const binding = this.bindingsForParent[0]; // should be the only item.
    let s = new ScopeState(this);
    merge(s.functionDeclarations, new MultiMap([[binding.name, new Declaration(binding, DeclarationType.FUNCTION_DECLARATION)]]));
    s.bindingsForParent = [];
    return s;
  }

  /*
   * Observe a reference to a variable
   */
  addReferences(accessibility, keepBindingsForParent = false) {
    let freeMap = new MultiMap;
    merge(freeMap, this.freeIdentifiers);
    this.bindingsForParent.forEach(binding => freeMap.set(binding.name, new Reference(binding, accessibility)));
    let s = new ScopeState(this);
    s.freeIdentifiers = freeMap;
    if (!keepBindingsForParent) {
      s.bindingsForParent = [];
    }
    return s;
  }

  taint() {
    let s = new ScopeState(this);
    s.dynamic = true;
    return s;
  }

  withoutBindingsForParent() {
    let s = new ScopeState(this);
    s.bindingsForParent = [];
    return s;
  }

  withParameterExpressions() {
    let s = new ScopeState(this);
    s.hasParameterExpressions = true;
    return s;
  }

  withoutParameterExpression() {
    let s = new ScopeState(this);
    s.hasParameterExpressions = false;
    return s;
  }

  withPotentialVarFunctions(functions) {
    let pvsfd = merge(new MultiMap, this.potentiallyVarScopedFunctionDeclarations);
    functions.forEach(f => pvsfd.put(f.name, f));
    let s = new ScopeState(this);
    s.potentiallyVarScopedFunctionDeclarations = pvsfd;
    return s;
  }

  /*
   * Used when a scope boundary is encountered. Resolves found free identifiers
   * and declarations into variable objects. Any free identifiers remaining are
   * carried forward into the new state object.
   */
  finish(astNode, scopeType, shouldResolveArguments = false) { // todo
    let variables = [];
    let functionScoped = new MultiMap;
    let freeIdentifiers = merge(new MultiMap, this.freeIdentifiers);
    let pvsfd = merge(new MultiMap, this.potentiallyVarScopedFunctionDeclarations);
    let children = this.children;

    this.blockScopedDeclarations.forEachEntry((v, k) => {
      pvsfd.delete(k);
    });
    this.functionDeclarations.forEachEntry((v, k) => {
      const existing = pvsfd.get(k);
      if (existing && (v.length > 1 || v[0].node !== existing)) {
        pvsfd.delete(k);
      }
    })

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

      let declarations = new MultiMap;
      if (scopeType === ScopeType.SCRIPT) {
        // top-level lexical declarations in scripts are not globals, so create a separate scope for them 
        children = [new Scope(children, resolveDeclarations(freeIdentifiers, this.blockScopedDeclarations, []), freeIdentifiers, ScopeType.SCRIPT, this.dynamic, astNode)];
      } else {
        merge(declarations, this.blockScopedDeclarations);
      }
      
      if (shouldResolveArguments) {
        declarations.set('arguments');
      }
      merge(declarations, this.functionScopedDeclarations);
      merge(declarations, this.functionDeclarations);

      // B.3.3
      if (scopeType === ScopeType.ARROW_FUNCTION || scopeType === ScopeType.FUNCTION) { // maybe also scripts? spec currently doesn't say to, but that may be a bug.
        merge(declarations, pvsfd);
      }
      pvsfd = new MultiMap;

      variables = resolveDeclarations(freeIdentifiers, declarations, variables);

      // no declarations in a module are global
      if (scopeType === ScopeType.MODULE) {
        children = [new Scope(children, variables, freeIdentifiers, ScopeType.MODULE, this.dynamic, astNode)];
        variables = [];
      }
      break;
    default:
      throw new Error("not reached");
    }

    const scope = (scopeType === ScopeType.SCRIPT || scopeType === ScopeType.MODULE)
      ? new GlobalScope(children, variables, freeIdentifiers, astNode)
      : new Scope(children, variables, freeIdentifiers, scopeType, this.dynamic, astNode);

    return new ScopeState({
      freeIdentifiers: freeIdentifiers,
      functionScopedDeclarations: functionScoped,
      children: [scope],
      bindingsForParent: this.bindingsForParent,
      potentiallyVarScopedFunctionDeclarations: pvsfd
    });
  }
}
