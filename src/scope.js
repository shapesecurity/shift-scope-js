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

import Variable from './variable';

export class ScopeType {
  constructor(name) {
    this.name = name;
  }
}

ScopeType.GLOBAL = new ScopeType('Global');
ScopeType.MODULE = new ScopeType('Module');
ScopeType.SCRIPT = new ScopeType('Script');
ScopeType.ARROW_FUNCTION = new ScopeType('ArrowFunction');
ScopeType.FUNCTION = new ScopeType('Function');
ScopeType.FUNCTION_NAME = new ScopeType('FunctionName'); // named function expressions
ScopeType.CLASS_NAME = new ScopeType('ClassName'); // class declarations and named class expressions
ScopeType.PARAMETERS = new ScopeType('Parameters');
ScopeType.PARAMETER_EXPRESSION = new ScopeType('ParameterExpression');
ScopeType.WITH = new ScopeType('With');
ScopeType.CATCH = new ScopeType('Catch');
ScopeType.BLOCK = new ScopeType('Block');

export class Scope {
  constructor({ children, variables, through, type, isDynamic, astNode }) {
    this.children = children;
    this.through = through;
    this.type = type;
    this.astNode = astNode;

    this.variables = new Map;
    variables.forEach(v => this.variables.set(v.name, v));

    this.variableList = [];
    for (let x of this.variables.values()) {
      this.variableList.push(x);
    }

    this.dynamic = isDynamic || type === ScopeType.WITH || type === ScopeType.GLOBAL;
  }

  isGlobal() {
    return this.type === ScopeType.GLOBAL;
  }

  lookupVariable(name) {
    return this.variables.get(name);
  }
}

export class GlobalScope extends Scope {
  constructor({ children, variables, through, astNode }) {
    super({ children, variables, through, type: ScopeType.GLOBAL, isDynamic: true, astNode });
    through.forEachEntry((v, k) => {
      this.variables.set(k, new Variable(k, v, []));
    });
    this.variableList = [];
    for (let x of this.variables.values()) {
      this.variableList.push(x);
    }
  }
}
