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

import * as MultiMap from "multimap";

function merge(multiMap, otherMultiMap) {
  otherMultiMap.forEachEntry((v, k) => {
    multiMap.set.apply(multiMap, [k].concat(v));
  });
  return multiMap;
}

import {Scope, GlobalScope, ScopeType} from "./scope";
import Variable from "./variable";

function resolveArguments(freeIdentifiers, variables) {
  let args = freeIdentifiers.get("arguments") || [];
  freeIdentifiers.delete("arguments");
  return variables.concat(new Variable("arguments", args, []));
}

function resolveDeclarations(freeIdentifiers, decls, variables) {
  decls.forEachEntry((declarations, name) => {
    let references = freeIdentifiers.get(name) || [];
    variables = variables.concat(new Variable(name, references, declarations));
    freeIdentifiers.delete(name);
  });
  return variables;
}

export default class ScopeState {
  constructor(freeIdentifiers, functionScopedDeclarations, blockScopedDeclarations, children, dynamic) {
    this.freeIdentifiers = freeIdentifiers;
    this.functionScopedDeclarations = functionScopedDeclarations;
    this.blockScopedDeclarations = blockScopedDeclarations;
    this.children = children;
    this.dynamic = dynamic;
  }

  static empty() {
    return new ScopeState(
      new MultiMap,
      new MultiMap,
      new MultiMap,
      [],
      false
    );
  }

  /*
   * Monoidal append: merges the two states together
   */
  concat(b) {
    if (this === b) {
      return this;
    }
    return new ScopeState(
      merge(merge(new MultiMap, this.freeIdentifiers), b.freeIdentifiers),
      merge(merge(new MultiMap, this.functionScopedDeclarations), b.functionScopedDeclarations),
      merge(merge(new MultiMap, this.blockScopedDeclarations), b.blockScopedDeclarations),
      this.children.concat(b.children),
      this.dynamic || b.dynamic
    );
  }

  /*
   * Observe a variable entering scope
   */
  addDeclaration(decl) {
    let declMap = new MultiMap;
    merge(declMap, decl.type.isBlockScoped ? this.blockScopedDeclarations : this.functionScopedDeclarations);
    declMap.set(decl.node.name, decl);
    return new ScopeState(
      this.freeIdentifiers,
      decl.type.isBlockScoped ? this.functionScopedDeclarations : declMap,
      decl.type.isBlockScoped ? declMap : this.blockScopedDeclarations,
      this.children,
      this.dynamic
    );
  }

  /*
   * Observe a reference to a variable
   */
  addReference(ref) {
    let freeMap = new MultiMap;
    merge(freeMap, this.freeIdentifiers);
    freeMap.set(ref.node.name, ref);
    return new ScopeState(
      freeMap,
      this.functionScopedDeclarations,
      this.blockScopedDeclarations,
      this.children,
      this.dynamic
    );
  }

  taint() {
    return new ScopeState(
      this.freeIdentifiers,
      this.functionScopedDeclarations,
      this.blockScopedDeclarations,
      this.children,
      true
    );
  }

  /*
   * Used when a scope boundary is encountered. Resolves found free identifiers
   * and declarations into variable objects. Any free identifiers remaining are
   * carried forward into the new state object.
   */
  finish(astNode, scopeType) {
    let variables = [];
    let functionScope = new MultiMap;
    let freeIdentifiers = new MultiMap;

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

    let scope = scopeType === ScopeType.GLOBAL
      ? new GlobalScope(this.children, variables, freeIdentifiers, astNode)
      : new Scope(this.children, variables, freeIdentifiers, scopeType, this.dynamic, astNode);

    return new ScopeState(
      freeIdentifiers,
      functionScope,
      new MultiMap,
      [scope],
      false
    );
  }
}
