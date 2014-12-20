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

import * as Map from "es6-map";
import Variable from "./variable";

export class ScopeType {
  constructor(name) {
    this.name = name;
  }
}

ScopeType.GLOBAL = new ScopeType("global");
ScopeType.FUNCTION = new ScopeType("function");
ScopeType.FUNCTION_NAME = new ScopeType("function name");
ScopeType.WITH = new ScopeType("with");
ScopeType.CATCH = new ScopeType("catch");
ScopeType.BLOCK = new ScopeType("block");

export class Scope {
  constructor(children, variables, through, type, isDynamic, astNode) {
    this.children = children;
    this.through = through;
    this.type = type;
    this.astNode = astNode;

    this.variables = new Map;
    variables.forEach(v => this.variables.set(v.name, v));

    this.variableList = [];
    for(let x of this.variables.values()) {
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

  findVariables(identifier) {
    // TODO
  }
}

export class GlobalScope extends Scope {
  constructor(children, variables, through, astNode) {
    super(children, variables, through, ScopeType.GLOBAL, true, astNode);
    through.forEachEntry((v, k) => {
      this.variables.set(k, new Variable(k, v, []));
    });
    this.variableList = [];
    for(let x of this.variables.values()) {
      this.variableList.push(x);
    }
  }
}
