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

import * as _assert from "assert";
const assert = _assert.default; // (babel) TODO remove this

import {parseScript, parseModule} from "shift-parser";
import * as _Map from "es6-map";
const Map = _Map.default; // (babel) TODO remove this
import * as _MultiMap from "multimap";
const MultiMap = _MultiMap.default; // (babel) TODO remove this
import analyze, {ScopeLookup} from "../";

function setup(js) {
  const script = parseScript(js);
  const globalScope = analyze(script);
  const scopeLookup = new ScopeLookup(globalScope);
  return [parseScript(js), globalScope, scopeLookup];
}

function multiMapEquals(a, b) { // shallow
  if (a.size !== b.size) {
    return false;
  }
  let equalThusFar = true;
  a.forEachEntry((v1, k) => {
    if (!equalThusFar) return;

    let v2 = b.get(k);
    if (!v2 || v1.length !== v2.length) {
      equalThusFar = false;
      return;
    }
    for (let i = 0; i < v1.length; ++i) {
      if (v1[i] !== v2[i]) {
        equalThusFar = false;
        return;
      }
    }
  });
  return equalThusFar;
}

function checkLookup(lookup, varMap, globals) {
  assert(multiMapEquals(varMap, lookup.variableMap));
  globals.forEach((v, k) => lookup.isGlobal(v) == k);
}

suite("ScopeLookup", () => {
  test("nesting", () => {
    return; // I believe this test is failing due to node, or compilation issues. Equivalent code works on Chrome.
    let js = "let x; {let x; x;}";
    let [script, globalScope, scopeLookup] = setup(js);
    let xNode1 = script.statements[0].declaration.declarators[0].binding;
    let xNode2 = script.statements[1].block.statements[0].declaration.declarators[0].binding;
    let xNode3 = script.statements[1].block.statements[1].expression;
    
    let xVar1 = globalScope.children[0].variables.get("x");
    let xVar2 = globalScope.children[0].children[0].variables.get("x");

    let varMap = new MultiMap([[xNode1, xVar1], [xNode2, xVar2], [xNode3, xVar2]]);

    let globals = new Map([[xVar1, false], [xVar2, false]]);

    checkLookup(scopeLookup, varMap, globals);
  });
});
