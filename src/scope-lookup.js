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
const { GlobalScope } = require('./scope');

module.exports = class ScopeLookup {
  constructor(globalScope) {
    this.scope = globalScope;
    this.variableMap = new MultiMap;

    const addVariable = v => {
      v.declarations.forEach(decl => this.variableMap.set(decl.node, v));
      v.references.forEach(ref => {
        if (!this.variableMap.has(ref.node) || this.variableMap.get(ref.node).indexOf(v) === -1) {
          this.variableMap.set(ref.node, v);
        }
      });
    };
    (function addVariables(scope) {
      scope.children.forEach(addVariables);
      scope.variables.forEach(addVariable);
    }(globalScope));
  }

  lookup(node) {
    /* Gives a map from BindingIdentifiers and IdentifierExpressions to a list of Variables.
    Assuming that the given node is defined in the scope, the map always returns at least one Variable.
    It will return two in precisely three cases:
    `try{}catch(e){var e = ...}`, function declarations in blocks for which annex B.3.3 applies, and class declarations.
    In this case the same identifier refers to two variables.
    Both are returned, with the block-scoped variable being returned first in the first two cases, and the inner variable
    being returned first in the third case. */
    return this.variableMap.get(node);
  }

  isGlobal(node) {
    return this.scope instanceof GlobalScope && this.variableMap.has(node);
  }
};
