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

import assert from 'assert';

import { parseScript, parseModule } from 'shift-parser';
import analyze, { Accessibility, ScopeType, serialize } from '../';

const NO_REFERENCES = [];
const NO_DECLARATIONS = [];

// "variables" parameter is a mapping of variable names from this scope object to the list of their declarations and their references
function checkScope(scope, scopeNode, scopeType, isDynamic, children, through, variables, referenceTypes) {
  assert(scopeNode != null);
  assert.equal(scope.astNode, scopeNode);

  assert.equal(scope.type, scopeType);
  assert.equal(scope.dynamic, isDynamic);

  assert.equal(scope.children.length, children.length);
  children.forEach(child => {
    assert(scope.children.indexOf(child) >= 0);
  });

  assert.equal([...scope.through.keys()].length, through.length);
  through.forEach(name => {
    let references = scope.through.get(name);
    assert(references != null);
    assert(references.some(reference => reference.node.name === name));
  });

  assert.equal(scope.variableList.length, variables.size);
  variables.forEach((variableEntryValue, variableEntryKey) => {
    let maybeVariable = scope.lookupVariable(variableEntryKey);
    assert(maybeVariable != null);
    let variable = maybeVariable;

    let declarations = variableEntryValue[0];
    assert.equal(variable.declarations.length, declarations.length);
    declarations.forEach(node => {
      assert.notEqual(node, void 0); // todo this is to help with writing tests
      assert(variable.declarations.some(declaration => declaration.node === node));
    });

    let refs = variableEntryValue[1];
    assert.equal(variable.references.length, refs.length);
    refs.forEach(node => {
      assert.notEqual(node, void 0); // todo this is to help with writing tests
      let referencesWithNode = variable.references.filter(reference => reference.node === node);
      assert.notEqual(0, referencesWithNode.length);
      let ref = referencesWithNode[0];
      assert.equal(ref.node, node);
      let type = referenceTypes.get(ref.node);
      assert(type != null);
      assert.equal(ref.accessibility, type);
    });
  });
}

function checkScopeSerialization(js, serialization, { earlyErrors = true, asScript = true } = {}) {
  let script = (asScript ? parseScript : parseModule)(js, { earlyErrors });

  let globalScope = analyze(script);

  assert.equal(serialize(globalScope), serialization);
}

suite('unit', () => {
  test('VariableDeclaration 1', () => {
    const js = 'var v1; var v2 = 0;';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];

    let v1Node1 = script.statements[0].declaration.declarators[0].binding;
    let v2Node1 = script.statements[1].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node1], NO_REFERENCES]);
      variables.set('v2', [[v2Node1], [v2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v2Node1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
  });

  test('VariableDeclaration 2', () => {
    const js = 'var v1, v2 = 0;';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let v1Node1 = script.statements[0].declaration.declarators[0].binding;
    let v2Node1 = script.statements[0].declaration.declarators[1].binding;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node1], NO_REFERENCES]);
      variables.set('v2', [[v2Node1], [v2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v2Node1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
  });

  test('VariableDeclaration 3', () => {
    const js = 'v1 = 0; var v2 = v1;';
    let script = parseScript(js);
    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let v1Node1 = script.statements[0].expression.binding;
    let v1Node2 = script.statements[1].declaration.declarators[0].init;
    let v2Node1 = script.statements[1].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = ['v1'];

      let variables = new Map;
      variables.set('v1', [NO_DECLARATIONS, [v1Node1, v1Node2]]);
      variables.set('v2', [[v2Node1], [v2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v1Node1, Accessibility.WRITE);
      referenceTypes.set(v1Node2, Accessibility.READ);
      referenceTypes.set(v2Node1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
  });

  test('VariableDeclaration 4', () => {
    const js = 'var v2 = v1 + 0; var v1 = 0; ';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let v2Node1 = script.statements[0].declaration.declarators[0].binding;
    let v1Node1 = script.statements[0].declaration.declarators[0].init.left;
    let v1Node2 = script.statements[1].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node2], [v1Node1, v1Node2]]);
      variables.set('v2', [[v2Node1], [v2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v1Node1, Accessibility.READ);
      referenceTypes.set(v1Node2, Accessibility.WRITE);
      referenceTypes.set(v2Node1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
  });

  test('VariableDeclaration 5', () => {
    const js = 'var v1; var v1 = 0; var v2 = v1 + 0;';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let v1Node1 = script.statements[0].declaration.declarators[0].binding;
    let v1Node2 = script.statements[1].declaration.declarators[0].binding;
    let v1Node3 = script.statements[2].declaration.declarators[0].init.left;
    let v2Node1 = script.statements[2].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node1, v1Node2], [v1Node2, v1Node3]]);
      variables.set('v2', [[v2Node1], [v2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v1Node2, Accessibility.WRITE);
      referenceTypes.set(v1Node3, Accessibility.READ);
      referenceTypes.set(v2Node1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
  });

  test('FunctionDeclaration 1', () => {
    const js =
      `function f1(p1, p2) {
        var v1 = 1;
        function f2(p1) {
          var v2 = p1 + v1 + p2;
          return v2;
        }
        return f2;
      }
      var r = f1(2, 3);`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let f1Scope = scriptScope.children[0];
    let f1ScopeNode = script.statements[0];
    let f2Scope = scriptScope.children[0].children[0];
    let f2ScopeNode = f1ScopeNode.body.statements[1];

    let f1Node1 = script.statements[0].name;
    let f1Node2 = script.statements[1].declaration.declarators[0].init.callee;
    let f2Node1 = script.statements[0].body.statements[1].name;
    let f2Node2 = script.statements[0].body.statements[2].expression;
    let p1Node1 = script.statements[0].params.items[0];
    let p1Node2 = script.statements[0].body.statements[1].params.items[0];
    let p1Node3 = script.statements[0].body.statements[1].body.statements[0].declaration.declarators[0].init.left.left;
    let p2Node1 = script.statements[0].params.items[1];
    let p2Node2 = script.statements[0].body.statements[1].body.statements[0].declaration.declarators[0].init.right;
    let rNode1 = script.statements[1].declaration.declarators[0].binding;
    let v1Node1 = script.statements[0].body.statements[0].declaration.declarators[0].binding;
    let v1Node2 = script.statements[0].body.statements[1].body.statements[0].declaration.declarators[0].init.left.right;
    let v2Node1 = script.statements[0].body.statements[1].body.statements[0].declaration.declarators[0].binding;
    let v2Node2 = script.statements[0].body.statements[1].body.statements[1].expression;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('f1', [[f1Node1], [f1Node2]]);
      variables.set('r', [[rNode1], [rNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(f1Node2, Accessibility.READ);
      referenceTypes.set(rNode1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // f1 scope
      let children = [f2Scope];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node1], [v1Node1, v1Node2]]);
      variables.set('p1', [[p1Node1], NO_REFERENCES]);
      variables.set('p2', [[p2Node1], [p2Node2]]);
      variables.set('f2', [[f2Node1], [f2Node2]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(v1Node1, Accessibility.WRITE);
      referenceTypes.set(v1Node2, Accessibility.READ);
      referenceTypes.set(p2Node2, Accessibility.READ);
      referenceTypes.set(f2Node2, Accessibility.READ);

      checkScope(f1Scope, f1ScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // f2 scope
      let children = [];
      let through = ['v1', 'p2'];

      let variables = new Map;
      variables.set('p1', [[p1Node2], [p1Node3]]);
      variables.set('v2', [[v2Node1], [v2Node1, v2Node2]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(p1Node3, Accessibility.READ);
      referenceTypes.set(v2Node1, Accessibility.WRITE);
      referenceTypes.set(v2Node2, Accessibility.READ);

      checkScope(f2Scope, f2ScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('FunctionDeclaration 2', () => {
    const js = 'function f() { f = 0; } f();';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fScope = scriptScope.children[0];
    let fScopeNode = script.statements[0];

    let fNode1 = script.statements[0].name;
    let fNode2 = script.statements[0].body.statements[0].expression.binding;
    let fNode3 = script.statements[1].expression.callee;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('f', [[fNode1], [fNode2, fNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode2, Accessibility.WRITE);
      referenceTypes.set(fNode3, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // f scope
      let children = [];
      let through = ['f'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(fScope, fScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('FunctionExpression 1', () => {
    const js = 'var f = function() { f = 0; }; f();';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fScope = scriptScope.children[0];
    let fScopeNode = script.statements[0].declaration.declarators[0].init;

    let fNode1 = script.statements[0].declaration.declarators[0].binding;
    let fNode2 = script.statements[0].declaration.declarators[0].init.body.statements[0].expression.binding;
    let fNode3 = script.statements[1].expression.callee;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('f', [[fNode1], [fNode1, fNode2, fNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode1, Accessibility.WRITE);
      referenceTypes.set(fNode2, Accessibility.WRITE);
      referenceTypes.set(fNode3, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // f scope
      let children = [];
      let through = ['f'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(fScope, fScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('FunctionExpression 2', () => {
    const js = 'var f2 = function f1() { f1 = 0; }; f1(); f2();';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let functionNameScope = scriptScope.children[0];
    let functionNameScopeNode = script.statements[0].declaration.declarators[0].init;
    let functionScope = functionNameScope.children[0];
    let functionScopeNode = functionNameScopeNode;

    let f1Node1 = script.statements[0].declaration.declarators[0].init.name;
    let f1Node2 = script.statements[0].declaration.declarators[0].init.body.statements[0].expression.binding;
    let f1Node3 = script.statements[1].expression.callee;
    let f2Node1 = script.statements[0].declaration.declarators[0].binding;
    let f2Node2 = script.statements[2].expression.callee;

    { // global scope
      let children = [scriptScope];
      let through = ['f1'];

      let variables = new Map;
      variables.set('f2', [[f2Node1], [f2Node1, f2Node2]]);
      variables.set('f1', [NO_DECLARATIONS, [f1Node3]]);

      let referenceTypes = new Map;
      referenceTypes.set(f2Node1, Accessibility.WRITE);
      referenceTypes.set(f2Node2, Accessibility.READ);
      referenceTypes.set(f1Node3, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function name scope
      let children = [functionScope];
      let through = [];

      let variables = new Map;
      variables.set('f1', [[f1Node1], [f1Node2]]);

      let referenceTypes = new Map;
      referenceTypes.set(f1Node2, Accessibility.WRITE);

      checkScope(functionNameScope, functionNameScopeNode, ScopeType.FUNCTION_NAME, false, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [];
      let through = ['f1'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(f1Node2, Accessibility.WRITE);

      checkScope(functionScope, functionScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('HoistDeclaration 1', () => {
    const js =
      `var foo = 1;
      function bar() {
        if (!foo) {
          var foo = 0;
        }
        baz(foo);
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let functionScope = scriptScope.children[0];
    let functionScopeNode = script.statements[1];
    let ifScope = functionScope.children[0];

    let fooNode1 = script.statements[0].declaration.declarators[0].binding;
    let fooNode2 = script.statements[1].body.statements[0].test.operand;
    let fooNode3 = script.statements[1].body.statements[0].consequent.block.statements[0].declaration.declarators[0].binding;
    let fooNode4 = script.statements[1].body.statements[1].expression.arguments[0];
    let barNode1 = script.statements[1].name;
    let bazNode1 = script.statements[1].body.statements[1].expression.callee;

    { // global scope
      let children = [scriptScope];
      let through = ['baz'];

      let variables = new Map;
      variables.set('foo', [[fooNode1], [fooNode1]]);
      variables.set('bar', [[barNode1], NO_REFERENCES]);
      variables.set('baz', [NO_DECLARATIONS, [bazNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(fooNode1, Accessibility.WRITE);
      referenceTypes.set(bazNode1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [ifScope];
      let through = ['baz'];

      let variables = new Map;
      variables.set('foo', [[fooNode3], [fooNode2, fooNode3, fooNode4]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(fooNode2, Accessibility.READ);
      referenceTypes.set(fooNode3, Accessibility.WRITE);
      referenceTypes.set(fooNode4, Accessibility.READ);

      checkScope(functionScope, functionScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('HoistDeclaration 2', () => {
    const js =
      `var a = 1;
      function b() {
        a = 10;
        return;
        function a(){}
      }
      b();
      c(a);`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let bScope = scriptScope.children[0];
    let bScopeNode = script.statements[1];
    let aScope = bScope.children[0];
    let aScopeNode = bScopeNode.body.statements[2];

    let aNode1 = script.statements[0].declaration.declarators[0].binding;
    let bNode1 = script.statements[1].name;
    let aNode2 = script.statements[1].body.statements[0].expression.binding;
    let aNode3 = script.statements[1].body.statements[2].name;
    let bNode2 = script.statements[2].expression.callee;
    let cNode1 = script.statements[3].expression.callee;
    let aNode4 = script.statements[3].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['c'];

      let variables = new Map;
      variables.set('a', [[aNode1], [aNode1, aNode4]]);
      variables.set('b', [[bNode1], [bNode2]]);
      variables.set('c', [NO_DECLARATIONS, [cNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(aNode1, Accessibility.WRITE);
      referenceTypes.set(aNode4, Accessibility.READ);
      referenceTypes.set(bNode2, Accessibility.READ);
      referenceTypes.set(cNode1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // b scope
      let children = [aScope];
      let through = [];

      let variables = new Map;
      variables.set('a', [[aNode3], [aNode2]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(aNode2, Accessibility.WRITE);

      checkScope(bScope, bScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // a scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(aScope, aScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('HoistDeclaration 3', () => {
    const js =
      `function foo() {
        function bar() {
          return;
        }
        return bar();
        function bar() {
          return;
        }
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fooScope = scriptScope.children[0];
    let fooScopeNode = script.statements[0];
    let barScope1 = fooScope.children[0];
    let barScope1Node = barScope1.astNode;
    let barScope2 = fooScope.children[1];
    let barScope2Node = barScope2.astNode;

    let fooNode1 = script.statements[0].name;
    let barNode1 = script.statements[0].body.statements[0].name;
    let barNode2 = script.statements[0].body.statements[1].expression.callee;
    let barNode3 = script.statements[0].body.statements[2].name;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('foo', [[fooNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // foo scope
      let children = [barScope1, barScope2];
      let through = [];

      let variables = new Map;
      variables.set('bar', [[barNode1, barNode3], [barNode2]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(barNode2, Accessibility.READ);

      checkScope(fooScope, fooScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // bar1 scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(barScope1, barScope1Node, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // bar2 scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(barScope2, barScope2Node, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('HoistDeclaration 4', () => {
    const js = 'foo(); function foo() {}';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fooScope = scriptScope.children[0];
    let fooScopeNode = script.statements[1];

    let fooNode1 = script.statements[0].expression.callee;
    let fooNode2 = script.statements[1].name;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('foo', [[fooNode2], [fooNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(fooNode1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // foo scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(fooScope, fooScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('HoistDeclaration 5', () => {
    const js =
      `function foo() {
        return bar();
        var bar = function() {
          return 0;
        }
        var bar = function() {
          return;
        }
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fooScope = scriptScope.children[0];
    let fooScopeNode = script.statements[0];
    let barScope1 = fooScope.children[0];
    let barScope1Node = barScope1.astNode;
    let barScope2 = fooScope.children[1];
    let barScope2Node = barScope2.astNode;

    let fooNode1 = script.statements[0].name;
    let barNode1 = script.statements[0].body.statements[0].expression.callee;
    let barNode2 = script.statements[0].body.statements[1].declaration.declarators[0].binding;
    let barNode3 = script.statements[0].body.statements[2].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('foo', [[fooNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // foo scope
      let children = [barScope1, barScope2];
      let through = [];

      let variables = new Map;
      variables.set('bar', [[barNode2, barNode3], [barNode1, barNode2, barNode3]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(barNode1, Accessibility.READ);
      referenceTypes.set(barNode2, Accessibility.WRITE);
      referenceTypes.set(barNode3, Accessibility.WRITE);

      checkScope(fooScope, fooScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // bar scope 1
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(barScope1, barScope1Node, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
    { // bar scope 2
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(barScope2, barScope2Node, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('Closure 1', () => {
    const js = '(function() { f1 = 0; f2(f1); });';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let functionScope = scriptScope.children[0];
    let functionScopeNode = script.statements[0].expression;

    let f1Node1 = script.statements[0].expression.body.statements[0].expression.binding;
    let f2Node1 = script.statements[0].expression.body.statements[1].expression.callee;
    let f1Node2 = script.statements[0].expression.body.statements[1].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['f1', 'f2'];

      let variables = new Map;
      variables.set('f1', [NO_DECLARATIONS, [f1Node1, f1Node2]]);
      variables.set('f2', [NO_DECLARATIONS, [f2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(f1Node1, Accessibility.WRITE);
      referenceTypes.set(f1Node2, Accessibility.READ);
      referenceTypes.set(f2Node1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [];
      let through = ['f1', 'f2'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(functionScope, functionScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('Closure 2', () => {
    const js = '(function() { var f1 = 0; f2(f1); });';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let functionScope = scriptScope.children[0];
    let functionScopeNode = script.statements[0].expression;

    let f1Node1 = script.statements[0].expression.body.statements[0].declaration.declarators[0].binding;
    let f2Node1 = script.statements[0].expression.body.statements[1].expression.callee;
    let f1Node2 = script.statements[0].expression.body.statements[1].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['f2'];

      let variables = new Map;
      variables.set('f2', [NO_DECLARATIONS, [f2Node1]]);

      let referenceTypes = new Map;
      referenceTypes.set(f2Node1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [];
      let through = ['f2'];

      let variables = new Map;
      variables.set('f1', [[f1Node1], [f1Node1, f1Node2]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(f1Node1, Accessibility.WRITE);
      referenceTypes.set(f1Node2, Accessibility.READ);

      checkScope(functionScope, functionScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('Argument 1', () => {
    const js = 'function f(arg1, arg2) { var v1 = arg1 + arg2; }';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fScope = scriptScope.children[0];
    let fScopeNode = script.statements[0];

    let fNode1 = script.statements[0].name;
    let arg1Node1 = script.statements[0].params.items[0];
    let arg2Node1 = script.statements[0].params.items[1];
    let v1Node1 = script.statements[0].body.statements[0].declaration.declarators[0].binding;
    let arg1Node2 = script.statements[0].body.statements[0].declaration.declarators[0].init.left;
    let arg2Node2 = script.statements[0].body.statements[0].declaration.declarators[0].init.right;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('f', [[fNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('arg1', [[arg1Node1], [arg1Node2]]);
      variables.set('arg2', [[arg2Node1], [arg2Node2]]);
      variables.set('v1', [[v1Node1], [v1Node1]]);
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(arg1Node2, Accessibility.READ);
      referenceTypes.set(arg2Node2, Accessibility.READ);
      referenceTypes.set(v1Node1, Accessibility.WRITE);

      checkScope(fScope, fScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('Argument 2', () => {
    const js = 'function f() { var v1 = arguments[0]; }';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fScope = scriptScope.children[0];
    let fScopeNode = script.statements[0];

    let fNode1 = script.statements[0].name;
    let v1Node1 = script.statements[0].body.statements[0].declaration.declarators[0].binding;
    let argumentsNode1 = script.statements[0].body.statements[0].declaration.declarators[0].init.object;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('f', [[fNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // function scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('v1', [[v1Node1], [v1Node1]]);
      variables.set('arguments', [NO_DECLARATIONS, [argumentsNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(v1Node1, Accessibility.WRITE);
      referenceTypes.set(argumentsNode1, Accessibility.READ);

      checkScope(fScope, fScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('WithStatement 1', () => {
    const js = 'with (Math) { var x = cos(1 * PI); f(x); }';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let withScope = scriptScope.children[0];
    let withScopeNode = script.statements[0];
    let blockScope = withScope.children[0];

    let mathNode1 = script.statements[0].object;
    let xNode1 = script.statements[0].body.block.statements[0].declaration.declarators[0].binding;
    let cosNode1 = script.statements[0].body.block.statements[0].declaration.declarators[0].init.callee;
    let piNode1 = script.statements[0].body.block.statements[0].declaration.declarators[0].init.arguments[0].right;
    let fNode1 = script.statements[0].body.block.statements[1].expression.callee;
    let xNode2 = script.statements[0].body.block.statements[1].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['Math', 'cos', 'PI', 'f'];

      let variables = new Map;
      variables.set('Math', [NO_DECLARATIONS, [mathNode1]]);
      variables.set('cos', [NO_DECLARATIONS, [cosNode1]]);
      variables.set('PI', [NO_DECLARATIONS, [piNode1]]);
      variables.set('f', [NO_DECLARATIONS, [fNode1]]);
      variables.set('x', [[xNode1], [xNode1, xNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(mathNode1, Accessibility.READ);
      referenceTypes.set(cosNode1, Accessibility.READ);
      referenceTypes.set(piNode1, Accessibility.READ);
      referenceTypes.set(fNode1, Accessibility.READ);
      referenceTypes.set(xNode1, Accessibility.WRITE);
      referenceTypes.set(xNode2, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // with scope
      let children = [blockScope];
      let through = ['x', 'cos', 'PI', 'f'];

      let variables = new Map;

      let referenceTypes = new Map;

      checkScope(withScope, withScopeNode, ScopeType.WITH, true, children, through, variables, referenceTypes);
    }
  });

  test('WithStatement 2', () => {
    const js =
      `var o = {
        a : {
          b : {
            p1 : 0,
            p2 : 1,
          }
        }
      };
      with (o.a.b) {
        f(p1);
        f(p2);
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let withScope = scriptScope.children[0];
    let withScopeNode = script.statements[1];
    let blockScope = withScope.children[0];

    let oNode1 = script.statements[0].declaration.declarators[0].binding;
    let oNode2 = script.statements[1].object.object.object;
    let fNode1 = script.statements[1].body.block.statements[0].expression.callee;
    let p1Node1 = script.statements[1].body.block.statements[0].expression.arguments[0];
    let fNode2 = script.statements[1].body.block.statements[1].expression.callee;
    let p2Node1 = script.statements[1].body.block.statements[1].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['f', 'p1', 'p2'];

      let variables = new Map;
      variables.set('f', [NO_DECLARATIONS, [fNode1, fNode2]]);
      variables.set('p1', [NO_DECLARATIONS, [p1Node1]]);
      variables.set('p2', [NO_DECLARATIONS, [p2Node1]]);
      variables.set('o', [[oNode1], [oNode1, oNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode1, Accessibility.READ);
      referenceTypes.set(fNode2, Accessibility.READ);
      referenceTypes.set(p1Node1, Accessibility.READ);
      referenceTypes.set(p2Node1, Accessibility.READ);
      referenceTypes.set(oNode1, Accessibility.WRITE);
      referenceTypes.set(oNode2, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // with scope
      let children = [blockScope];
      let through = ['f', 'p1', 'p2'];

      let variables = new Map;

      let referenceTypes = new Map;

      checkScope(withScope, withScopeNode, ScopeType.WITH, true, children, through, variables, referenceTypes);
    }
  });

  test('TryCatchStatement 1', () => {
    const js =
      `try {
        f(0);
      } catch(err) {
        f(err);
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let catchScope = scriptScope.children[1];
    let catchScopeNode = script.statements[0].catchClause;
    let catchBlockScope = catchScope.children[0];

    let fNode1 = script.statements[0].body.statements[0].expression.callee;
    let errNode1 = script.statements[0].catchClause.binding;
    let fNode2 = script.statements[0].catchClause.body.statements[0].expression.callee;
    let errNode2 = script.statements[0].catchClause.body.statements[0].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['f'];

      let variables = new Map;
      variables.set('f', [NO_DECLARATIONS, [fNode1, fNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode1, Accessibility.READ);
      referenceTypes.set(fNode2, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // catch scope
      let children = [catchBlockScope];
      let through = ['f'];

      let variables = new Map;
      variables.set('err', [[errNode1], [errNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(errNode2, Accessibility.READ);

      checkScope(catchScope, catchScopeNode, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
  });

  test('TryCatchStatement 2', () => {
    const js =
      `try {
        f(0);
      } catch(err1) {
        try {
          throw err1.message;
        } catch(err2) {
          f(err1);
          f(err2);
        }
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let catchScope1 = scriptScope.children[1];
    let catchScope1Node = script.statements[0].catchClause;
    let catchBlockScope1 = catchScope1.children[0];
    let catchScope2 = catchBlockScope1.children[1];
    let catchScope2Node = script.statements[0].catchClause.body.statements[0].catchClause;
    let catchBlockScope2 = catchScope2.children[0];

    let fNode1 = script.statements[0].body.statements[0].expression.callee;
    let err1Node1 = script.statements[0].catchClause.binding;
    let err1Node2 = script.statements[0].catchClause.body.statements[0].body.statements[0].expression.object;
    let err2Node1 = script.statements[0].catchClause.body.statements[0].catchClause.binding;
    let fNode2 = script.statements[0].catchClause.body.statements[0].catchClause.body.statements[0].expression.callee;
    let err1Node3 = script.statements[0].catchClause.body.statements[0].catchClause.body.statements[0].expression.arguments[0];
    let fNode3 = script.statements[0].catchClause.body.statements[0].catchClause.body.statements[1].expression.callee;
    let err2Node2 = script.statements[0].catchClause.body.statements[0].catchClause.body.statements[1].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['f'];

      let variables = new Map;
      variables.set('f', [NO_DECLARATIONS, [fNode1, fNode2, fNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode1, Accessibility.READ);
      referenceTypes.set(fNode2, Accessibility.READ);
      referenceTypes.set(fNode3, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // catch scope 1
      let children = [catchBlockScope1];
      let through = ['f'];

      let variables = new Map;
      variables.set('err1', [[err1Node1], [err1Node2, err1Node3]]);

      let referenceTypes = new Map;
      referenceTypes.set(err1Node2, Accessibility.READ);
      referenceTypes.set(err1Node3, Accessibility.READ);

      checkScope(catchScope1, catchScope1Node, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
    { // catch scope 2
      let children = [catchBlockScope2];
      let through = ['f', 'err1'];

      let variables = new Map;
      variables.set('err2', [[err2Node1], [err2Node2]]);

      let referenceTypes = new Map;
      referenceTypes.set(err2Node2, Accessibility.READ);

      checkScope(catchScope2, catchScope2Node, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
  });

  test('TryCatchStatement 3', () => {
    const js =
      `try {
        f(0);
      } catch(err) {
        var err = 1;
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let catchScope = scriptScope.children[1];
    let catchScopeNode = script.statements[0].catchClause;
    let catchBlockScope = catchScope.children[0];

    let fNode1 = script.statements[0].body.statements[0].expression.callee;
    let errNode1 = script.statements[0].catchClause.binding;
    let errNode2 = script.statements[0].catchClause.body.statements[0].declaration.declarators[0].binding;

    { // global scope
      let children = [scriptScope];
      let through = ['f'];

      let variables = new Map;
      variables.set('err', [[errNode2], NO_REFERENCES]);
      variables.set('f', [NO_DECLARATIONS, [fNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode1, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // catch scope
      let children = [catchBlockScope];
      let through = [];

      let variables = new Map;
      variables.set('err', [[errNode1], [errNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(errNode2, Accessibility.WRITE);

      checkScope(catchScope, catchScopeNode, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
  });

  test('block-scoped declaration in CatchClause', () => {
    const js =
      `try { throw 0; } catch (e) { e; }
      try { throw 0; } catch (f) { let a; f }
      try { throw 0; } catch (g) { g; }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let [, catchScope0, , catchScope1, , catchScope2] = scriptScope.children;

    let catchScope0Node = script.statements[0].catchClause;
    let catchBlockScope0 = catchScope0.children[0];

    let catchScope1Node = script.statements[1].catchClause;
    let catchBlockScope1 = catchScope1.children[0];
    let catchBlockScope1Node = catchScope1Node.body;

    let catchScope2Node = script.statements[2].catchClause;
    let catchBlockScope2 = catchScope2.children[0];
    let catchBlockScope2Node = catchScope2Node.body;

    let eNode1 = script.statements[0].catchClause.binding;
    let eNode2 = script.statements[0].catchClause.body.statements[0].expression;

    let fNode1 = script.statements[1].catchClause.binding;
    let aNode1 = script.statements[1].catchClause.body.statements[0].declaration.declarators[0].binding;
    let fNode2 = script.statements[1].catchClause.body.statements[1].expression;

    let gNode1 = script.statements[2].catchClause.binding;
    let gNode2 = script.statements[2].catchClause.body.statements[0].expression;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;

      let referenceTypes = new Map;

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // first catch scope
      let children = [catchBlockScope0];
      let through = [];

      let variables = new Map;
      variables.set('e', [[eNode1], [eNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(eNode2, Accessibility.READ);

      checkScope(catchScope0, catchScope0Node, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
    { // second catch scope
      let children = [catchBlockScope1];
      let through = [];

      let variables = new Map;
      variables.set('f', [[fNode1], [fNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(fNode2, Accessibility.READ);

      checkScope(catchScope1, catchScope1Node, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
    { // second catch scope's block
      let children = [];
      let through = ['f'];

      let variables = new Map;
      variables.set('a', [[aNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(catchBlockScope1, catchBlockScope1Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // third catch scope
      let children = [catchBlockScope2];
      let through = [];

      let variables = new Map;
      variables.set('g', [[gNode1], [gNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(gNode2, Accessibility.READ);

      checkScope(catchScope2, catchScope2Node, ScopeType.CATCH, false, children, through, variables, referenceTypes);
    }
    { // third catch scope's block
      let children = [];
      let through = ['g'];

      let variables = new Map;

      let referenceTypes = new Map;

      checkScope(catchBlockScope2, catchBlockScope2Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
  });

  test('block-scoped declaration in ForInStatement', () => {
    // todo I believe this test is wrong: 13.7.5.12 seems to say that the expr is evaluated in a context where the names in the LHS are visible.
    /*
    const js =
      `for(let a in a) { a; }
      for(let b in b) b;
      for(let c in c) { let c; c; }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let [forInScope0, forInScope1, forInScope2] = scriptScope.children;
    let forInScope0Node = script.statements[0];
    let forInScope1Node = script.statements[1];
    let forInScope2Node = script.statements[2];
    let blockScope0 = forInScope0.children[0];
    let blockScope0Node = script.statements[0].body.block;
    let blockScope2 = forInScope2.children[0];
    let blockScope2Node = script.statements[2].body.block;

    let aNode1 = script.statements[0].left.declarators[0].binding;
    let aNode2 = script.statements[0].right;
    let aNode3 = script.statements[0].body.block.statements[0].expression;

    let bNode1 = script.statements[1].left.declarators[0].binding;
    let bNode2 = script.statements[1].right;
    let bNode3 = script.statements[1].body.expression;

    let cNode1 = script.statements[2].left.declarators[0].binding;
    let cNode2 = script.statements[2].right;
    let cNode3 = script.statements[2].body.block.statements[0].declaration.declarators[0].binding;
    let cNode4 = script.statements[2].body.block.statements[1].expression;

    { // global scope
      let children = [scriptScope];
      let through = ['a', 'b', 'c'];

      let variables = new Map;
      variables.set('a', [NO_DECLARATIONS, [aNode2]]);
      variables.set('b', [NO_DECLARATIONS, [bNode2]]);
      variables.set('c', [NO_DECLARATIONS, [cNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(aNode2, Accessibility.READ);
      referenceTypes.set(bNode2, Accessibility.READ);
      referenceTypes.set(cNode2, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // first for-in scope
      let children = [blockScope0];
      let through = [];

      let variables = new Map;
      variables.set('a', [[aNode1], [aNode1, aNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(aNode1, Accessibility.WRITE);
      referenceTypes.set(aNode3, Accessibility.READ);

      checkScope(forInScope0, forInScope0Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // second for-in scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('b', [[bNode1], [bNode1, bNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(bNode1, Accessibility.WRITE);
      referenceTypes.set(bNode3, Accessibility.READ);

      checkScope(forInScope1, forInScope1Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // third for-in scope
      let children = [blockScope2];
      let through = [];

      let variables = new Map;
      variables.set('c', [[cNode1], [cNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(cNode1, Accessibility.WRITE);

      checkScope(forInScope2, forInScope2Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // third for-in scope's block
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('c', [[cNode3], [cNode4]]);

      let referenceTypes = new Map;
      referenceTypes.set(cNode4, Accessibility.READ);

      checkScope(blockScope, blockScopeNode, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    */
  });

  test('block-scoped declaration in ForStatement', () => {
    const js =
      `for(let a; d; e) { a; }
      for(let b; f; g) b;
      for(let c; h; i) { let c; c; }
      for(;;);`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let [forScope0, forScope1, forScope2] = scriptScope.children;
    let forScope0Node = script.statements[0];
    let forScope1Node = script.statements[1];
    let forScope2Node = script.statements[2];
    let blockScope0 = forScope0.children[0];
    let blockScope2 = forScope2.children[0];
    let blockScope2Node = script.statements[2].body.block;

    let aNode1 = script.statements[0].init.declarators[0].binding;
    let aNode2 = script.statements[0].body.block.statements[0].expression;
    let dNode = script.statements[0].test;
    let eNode = script.statements[0].update;

    let bNode1 = script.statements[1].init.declarators[0].binding;
    let bNode2 = script.statements[1].body.expression;
    let fNode = script.statements[1].test;
    let gNode = script.statements[1].update;

    let cNode1 = script.statements[2].init.declarators[0].binding;
    let cNode2 = script.statements[2].body.block.statements[0].declaration.declarators[0].binding;
    let cNode3 = script.statements[2].body.block.statements[1].expression;
    let hNode = script.statements[2].test;
    let iNode = script.statements[2].update;

    { // global scope
      let children = [scriptScope];
      let through = ['d', 'e', 'f', 'g', 'h', 'i'];

      let variables = new Map;
      variables.set('d', [NO_DECLARATIONS, [dNode]]);
      variables.set('e', [NO_DECLARATIONS, [eNode]]);
      variables.set('f', [NO_DECLARATIONS, [fNode]]);
      variables.set('g', [NO_DECLARATIONS, [gNode]]);
      variables.set('h', [NO_DECLARATIONS, [hNode]]);
      variables.set('i', [NO_DECLARATIONS, [iNode]]);

      let referenceTypes = new Map;
      referenceTypes.set(dNode, Accessibility.READ);
      referenceTypes.set(eNode, Accessibility.READ);
      referenceTypes.set(fNode, Accessibility.READ);
      referenceTypes.set(gNode, Accessibility.READ);
      referenceTypes.set(hNode, Accessibility.READ);
      referenceTypes.set(iNode, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // first for scope
      let children = [blockScope0];
      let through = ['d', 'e'];

      let variables = new Map;
      variables.set('a', [[aNode1], [aNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(aNode2, Accessibility.READ);

      checkScope(forScope0, forScope0Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // second for scope
      let children = [];
      let through = ['f', 'g'];

      let variables = new Map;
      variables.set('b', [[bNode1], [bNode2]]);

      let referenceTypes = new Map;
      referenceTypes.set(bNode2, Accessibility.READ);

      checkScope(forScope1, forScope1Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // third for scope
      let children = [blockScope2];
      let through = ['h', 'i'];

      let variables = new Map;
      variables.set('c', [[cNode1], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(forScope2, forScope2Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
    { // third for scope's block
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('c', [[cNode2], [cNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(cNode3, Accessibility.READ);

      checkScope(blockScope2, blockScope2Node, ScopeType.BLOCK, false, children, through, variables, referenceTypes);
    }
  });

  test('direct/indirect call to eval', () => {
    const js =
      `function f() {
        eval(s);
        function g() {
          (0, eval)(s);
        }
      }`;
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let fScope = scriptScope.children[0];
    let fScopeNode = script.statements[0];
    let gScope = fScope.children[0];
    let gScopeNode = fScopeNode.body.statements[1];

    let fNode = script.statements[0].name;
    let gNode = script.statements[0].body.statements[1].name;
    let evalNode1 = script.statements[0].body.statements[0].expression.callee;
    let evalNode2 = script.statements[0].body.statements[1].body.statements[0].expression.callee.right;
    let sNode1 = script.statements[0].body.statements[0].expression.arguments[0];
    let sNode2 = script.statements[0].body.statements[1].body.statements[0].expression.arguments[0];

    { // global scope
      let children = [scriptScope];
      let through = ['eval', 's'];

      let variables = new Map;
      variables.set('eval', [NO_DECLARATIONS, [evalNode1, evalNode2]]);
      variables.set('s', [NO_DECLARATIONS, [sNode1, sNode2]]);
      variables.set('f', [[fNode], NO_REFERENCES]);

      let referenceTypes = new Map;
      referenceTypes.set(evalNode1, Accessibility.READ);
      referenceTypes.set(evalNode2, Accessibility.READ);
      referenceTypes.set(sNode1, Accessibility.READ);
      referenceTypes.set(sNode2, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // f scope
      let children = [gScope];
      let through = ['eval', 's'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);
      variables.set('g', [[gNode], NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(fScope, fScopeNode, ScopeType.FUNCTION, true, children, through, variables, referenceTypes);
    }
    { // g scope
      let children = [];
      let through = ['eval', 's'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, NO_REFERENCES]);

      let referenceTypes = new Map;

      checkScope(gScope, gScopeNode, ScopeType.FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('arrow', () => {
    const js =
      'var x = x => ++x';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let xScope = scriptScope.children[0];
    let xScopeNode = script.statements[0].declaration.declarators[0].init;

    let xNode1 = script.statements[0].declaration.declarators[0].binding;
    let xNode2 = script.statements[0].declaration.declarators[0].init.params.items[0];
    let xNode3 = script.statements[0].declaration.declarators[0].init.body.operand;

    { // global scope
      let children = [scriptScope];
      let through = [];

      let variables = new Map;
      variables.set('x', [[xNode1], [xNode1]]);

      let referenceTypes = new Map;
      referenceTypes.set(xNode1, Accessibility.WRITE);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // x scope
      let children = [];
      let through = [];

      let variables = new Map;
      variables.set('x', [[xNode2], [xNode3]]);

      let referenceTypes = new Map;
      referenceTypes.set(xNode3, Accessibility.READWRITE);

      checkScope(xScope, xScopeNode, ScopeType.ARROW_FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('arrow arguments', () => {
    const js =
      '() => arguments';
    let script = parseScript(js);

    let globalScope = analyze(script);
    let scriptScope = globalScope.children[0];
    let aScope = scriptScope.children[0];
    let aScopeNode = script.statements[0].expression;

    let argumentsNode = script.statements[0].expression.body;

    { // global scope
      let children = [scriptScope];
      let through = ['arguments'];

      let variables = new Map;
      variables.set('arguments', [NO_DECLARATIONS, [argumentsNode]]);

      let referenceTypes = new Map;
      referenceTypes.set(argumentsNode, Accessibility.READ);

      checkScope(globalScope, script, ScopeType.GLOBAL, true, children, through, variables, referenceTypes);
    }
    { // arrow scope
      let children = [];
      let through = ['arguments'];

      let variables = new Map;

      let referenceTypes = new Map;

      checkScope(aScope, aScopeNode, ScopeType.ARROW_FUNCTION, false, children, through, variables, referenceTypes);
    }
  });

  test('destructuring', () => {
    checkScopeSerialization(
      'var {x, a:{b:y = z}} = null; var [z] = y;',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [{"name": "x", "references": [{"node": "BindingIdentifier(x)_6", "accessibility": "Write"}], "declarations": [{"node": "BindingIdentifier(x)_6", "kind": "Var"}]}, {"name": "y", "references": [{"node": "BindingIdentifier(y)_13", "accessibility": "Write"}, {"node": "IdentifierExpression(y)_21", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(y)_13", "kind": "Var"}]}, {"name": "z", "references": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}, {"node": "BindingIdentifier(z)_20", "accessibility": "Write"}], "declarations": [{"node": "BindingIdentifier(z)_20", "kind": "Var"}]}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}, {"node": "IdentifierExpression(y)_21", "accessibility": "Read"}, {"node": "BindingIdentifier(x)_6", "accessibility": "Write"}, {"node": "BindingIdentifier(y)_13", "accessibility": "Write"}, {"node": "BindingIdentifier(z)_20", "accessibility": "Write"}], "variables": [], "children": []}]}'
    );
  });

  test('binding', () => {
    checkScopeSerialization(
      'function foo(b){function r(){for(var b=0;;);}}',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [{"name": "foo", "references": [], "declarations": [{"node": "BindingIdentifier(foo)_2", "kind": "FunctionDeclaration"}]}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionDeclaration_1", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "b", "references": [], "declarations": [{"node": "BindingIdentifier(b)_4", "kind": "Parameter"}]}, {"name": "r", "references": [], "declarations": [{"node": "BindingIdentifier(r)_7", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_6", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "b", "references": [{"node": "BindingIdentifier(b)_13", "accessibility": "Write"}], "declarations": [{"node": "BindingIdentifier(b)_13", "kind": "Var"}]}], "children": [{"node": "ForStatement_10", "type": "Block", "isDynamic": false, "through": [{"node": "BindingIdentifier(b)_13", "accessibility": "Write"}], "variables": [], "children": []}]}]}]}]}'
    );
  });

  test('function double declaration', () => {
    checkScopeSerialization(
      '{let x; function x(){}}',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "Block_2", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "x", "references": [], "declarations": [{"node": "BindingIdentifier(x)_6", "kind": "Let"}, {"node": "BindingIdentifier(x)_8", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_7", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}',
      { earlyErrors: false }
    );

    checkScopeSerialization(
      'function f1(x){return x; function x(){}}',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [{"name": "f1", "references": [], "declarations": [{"node": "BindingIdentifier(f1)_2", "kind": "FunctionDeclaration"}]}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionDeclaration_1", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "x", "references": [{"node": "IdentifierExpression(x)_7", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(x)_4", "kind": "Parameter"}, {"node": "BindingIdentifier(x)_9", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_8", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}'
    );

    checkScopeSerialization(
      'function x(){}; var x = 1; function x(){}',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [{"name": "x", "references": [{"node": "BindingIdentifier(x)_9", "accessibility": "Write"}], "declarations": [{"node": "BindingIdentifier(x)_9", "kind": "Var"}, {"node": "BindingIdentifier(x)_2", "kind": "FunctionDeclaration"}, {"node": "BindingIdentifier(x)_12", "kind": "FunctionDeclaration"}]}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [{"node": "BindingIdentifier(x)_9", "accessibility": "Write"}], "variables": [], "children": [{"node": "FunctionDeclaration_1", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}, {"node": "FunctionDeclaration_11", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}'
    );

    checkScopeSerialization(
      'function f3() {return arguments; function arguments(){}}',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [{"name": "f3", "references": [], "declarations": [{"node": "BindingIdentifier(f3)_2", "kind": "FunctionDeclaration"}]}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionDeclaration_1", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [{"node": "IdentifierExpression(arguments)_6", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(arguments)_8", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_7", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}'
    );
  });

  test('parameter scope', () => {
    checkScopeSerialization(
      '!function(x){let y;};',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "x", "references": [], "declarations": [{"node": "BindingIdentifier(x)_5", "kind": "Parameter"}]}, {"name": "y", "references": [], "declarations": [{"node": "BindingIdentifier(y)_10", "kind": "Let"}]}], "children": []}]}]}'
    );

    checkScopeSerialization(
      '!function(x = 1){let y;};',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "Parameters", "isDynamic": false, "through": [], "variables": [{"name": "x", "references": [], "declarations": [{"node": "BindingIdentifier(x)_6", "kind": "Parameter"}]}], "children": [{"node": "BindingWithDefault_5", "type": "ParameterExpression", "isDynamic": false, "through": [], "variables": [], "children": []}, {"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "y", "references": [], "declarations": [{"node": "BindingIdentifier(y)_12", "kind": "Let"}]}], "children": []}]}]}]}'
    );

    checkScopeSerialization(
      '!function(x, y = () => (x,y,z)){let z;};',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "variables": [{"name": "z", "references": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "declarations": []}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "Parameters", "isDynamic": false, "through": [{"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "variables": [{"name": "x", "references": [{"node": "IdentifierExpression(x)_12", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(x)_5", "kind": "Parameter"}]}, {"name": "y", "references": [{"node": "IdentifierExpression(y)_13", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(y)_7", "kind": "Parameter"}]}], "children": [{"node": "BindingWithDefault_6", "type": "ParameterExpression", "isDynamic": false, "through": [{"node": "IdentifierExpression(x)_12", "accessibility": "Read"}, {"node": "IdentifierExpression(y)_13", "accessibility": "Read"}, {"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "variables": [], "children": [{"node": "ArrowExpression_8", "type": "ArrowFunction", "isDynamic": false, "through": [{"node": "IdentifierExpression(x)_12", "accessibility": "Read"}, {"node": "IdentifierExpression(y)_13", "accessibility": "Read"}, {"node": "IdentifierExpression(z)_14", "accessibility": "Read"}], "variables": [], "children": []}]}, {"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "z", "references": [], "declarations": [{"node": "BindingIdentifier(z)_19", "kind": "Let"}]}], "children": []}]}]}]}'
    );
  });

  test('shorthand properties', () => {
    checkScopeSerialization(
      '({a});',
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [{"node": "IdentifierExpression(a)_4", "accessibility": "Read"}], "variables": [{"name": "a", "references": [{"node": "IdentifierExpression(a)_4", "accessibility": "Read"}], "declarations": []}], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [{"node": "IdentifierExpression(a)_4", "accessibility": "Read"}], "variables": [], "children": []}]}'
    );
  });

  test('B.3.3', () => {
    checkScopeSerialization(
      `(function() {
        function getOuter(){return f;}
        var g;
        {
           f = 1;
           function f(){}
           g = f;
        }
      })();`,
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "f", "references": [{"node": "IdentifierExpression(f)_11", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_23", "kind": "FunctionB33"}]}, {"name": "g", "references": [{"node": "AssignmentTargetIdentifier(g)_28", "accessibility": "Write"}], "declarations": [{"node": "BindingIdentifier(g)_15", "kind": "Var"}]}, {"name": "getOuter", "references": [], "declarations": [{"node": "BindingIdentifier(getOuter)_7", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_6", "type": "Function", "isDynamic": false, "through": [{"node": "IdentifierExpression(f)_11", "accessibility": "Read"}], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}, {"node": "Block_17", "type": "Block", "isDynamic": false, "through": [{"node": "AssignmentTargetIdentifier(g)_28", "accessibility": "Write"}], "variables": [{"name": "f", "references": [{"node": "AssignmentTargetIdentifier(f)_20", "accessibility": "Write"}, {"node": "IdentifierExpression(f)_29", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_23", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_22", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}]}'
    );

    checkScopeSerialization(
      `!function f() {
        {
          function f(){}
        }
        {
          function f(){}
        }
        f;
      }`,
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "FunctionName", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_4", "kind": "FunctionExpressionName"}]}], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "f", "references": [{"node": "IdentifierExpression(f)_20", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_10", "kind": "FunctionB33"}, {"node": "BindingIdentifier(f)_16", "kind": "FunctionB33"}]}], "children": [{"node": "Block_8", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_10", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_9", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}, {"node": "Block_14", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_16", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_15", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}]}]}'
    );

    checkScopeSerialization( // As above, but as a module. Because B.3.3 only applies in strict mode, this case is substantially different from the previous.
      `!function f() {
        {
          function f(){}
        }
        {
          function f(){}
        }
        f;
      }`,
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "FunctionName", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [{"node": "IdentifierExpression(f)_20", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_4", "kind": "FunctionExpressionName"}]}], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [{"node": "IdentifierExpression(f)_20", "accessibility": "Read"}], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": [{"node": "Block_8", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_10", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_9", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}, {"node": "Block_14", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_16", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_15", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      `!function f() {
        if (0)
          function f(){}
        else
          function f(){}
        f;
      }`,
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "FunctionName", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_4", "kind": "FunctionExpressionName"}]}], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "f", "references": [{"node": "IdentifierExpression(f)_18", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_10", "kind": "FunctionDeclaration"}, {"node": "BindingIdentifier(f)_14", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_9", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}, {"node": "FunctionDeclaration_13", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}]}'
    );

    checkScopeSerialization(
      `!function(){
        {
          {
            let f;
            {
              function f(){}
            }
          }
          function f(){}
        }
        f;
      }`,
      '{"node": "Script_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Script_0", "type": "Script", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionExpression_3", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}, {"name": "f", "references": [{"node": "IdentifierExpression(f)_25", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(f)_21", "kind": "FunctionB33"}]}], "children": [{"node": "Block_7", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_21", "kind": "FunctionDeclaration"}]}], "children": [{"node": "Block_9", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_13", "kind": "Let"}]}], "children": [{"node": "Block_15", "type": "Block", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_17", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_16", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}, {"node": "FunctionDeclaration_20", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}]}'
    );
  });

  test('import', () => {
    checkScopeSerialization(
      'import a, {b} from ""',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "a", "references": [], "declarations": [{"node": "BindingIdentifier(a)_2", "kind": "Import"}]}, {"name": "b", "references": [], "declarations": [{"node": "BindingIdentifier(b)_4", "kind": "Import"}]}], "children": []}]}',
      { asScript: false }
    );
  });

  test('class', () => {
    checkScopeSerialization(
      'class C{}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [], "declarations": [{"node": "BindingIdentifier(C)_2", "kind": "ClassDeclaration"}]}], "children": [{"node": "ClassDeclaration_1", "type": "ClassName", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [], "declarations": [{"node": "BindingIdentifier(C)_2", "kind": "ClassName"}]}], "children": []}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'class C extends (()=>C, C, null) {f(){return C;}} C;',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_18", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(C)_2", "kind": "ClassDeclaration"}]}], "children": [{"node": "ClassDeclaration_1", "type": "ClassName", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_7", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_8", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_16", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(C)_2", "kind": "ClassName"}]}], "children": [{"node": "ArrowExpression_5", "type": "ArrowFunction", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_7", "accessibility": "Read"}], "variables": [], "children": []}, {"node": "Method_11", "type": "Function", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_16", "accessibility": "Read"}], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      '(class{})',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "ClassExpression_2", "type": "ClassName", "isDynamic": false, "through": [], "variables": [], "children": []}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      '(class C{})',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "ClassExpression_2", "type": "ClassName", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [], "declarations": [{"node": "BindingIdentifier(C)_3", "kind": "ClassName"}]}], "children": []}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      '(class C extends (()=>C, C, null) {f(){return C;}}); C;',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [{"node": "IdentifierExpression(C)_19", "accessibility": "Read"}], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_19", "accessibility": "Read"}], "declarations": []}], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_19", "accessibility": "Read"}], "variables": [], "children": [{"node": "ClassExpression_2", "type": "ClassName", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_8", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_9", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_17", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(C)_3", "kind": "ClassName"}]}], "children": [{"node": "ArrowExpression_6", "type": "ArrowFunction", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_8", "accessibility": "Read"}], "variables": [], "children": []}, {"node": "Method_12", "type": "Function", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_17", "accessibility": "Read"}], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}',
      { asScript: false }
    );
  });

  test('export default', () => {
    checkScopeSerialization(
      'export default class {}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "ClassDeclaration_2", "type": "ClassName", "isDynamic": false, "through": [], "variables": [], "children": []}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'export default class C extends (()=>C, C, null) {f(){return C;}} C;',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_19", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(C)_3", "kind": "ClassDeclaration"}]}], "children": [{"node": "ClassDeclaration_2", "type": "ClassName", "isDynamic": false, "through": [], "variables": [{"name": "C", "references": [{"node": "IdentifierExpression(C)_8", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_9", "accessibility": "Read"}, {"node": "IdentifierExpression(C)_17", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(C)_3", "kind": "ClassName"}]}], "children": [{"node": "ArrowExpression_6", "type": "ArrowFunction", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_8", "accessibility": "Read"}], "variables": [], "children": []}, {"node": "Method_12", "type": "Function", "isDynamic": false, "through": [{"node": "IdentifierExpression(C)_17", "accessibility": "Read"}], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'export default function() {}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [], "children": [{"node": "FunctionDeclaration_2", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'export default function f() {}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "f", "references": [], "declarations": [{"node": "BindingIdentifier(f)_3", "kind": "FunctionDeclaration"}]}], "children": [{"node": "FunctionDeclaration_2", "type": "Function", "isDynamic": false, "through": [], "variables": [{"name": "arguments", "references": [], "declarations": []}], "children": []}]}]}',
      { asScript: false }
    );
  });

  test('export local/from', () => {
    checkScopeSerialization(
      'let a; export {a} from \'m\'',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "a", "references": [], "declarations": [{"node": "BindingIdentifier(a)_4", "kind": "Let"}]}], "children": []}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'let a; export {a}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "a", "references": [{"node": "IdentifierExpression(a)_7", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(a)_4", "kind": "Let"}]}], "children": []}]}',
      { asScript: false }
    );

    checkScopeSerialization(
      'let a; export {a as b}',
      '{"node": "Module_0", "type": "Global", "isDynamic": true, "through": [], "variables": [], "children": [{"node": "Module_0", "type": "Module", "isDynamic": false, "through": [], "variables": [{"name": "a", "references": [{"node": "IdentifierExpression(a)_7", "accessibility": "Read"}], "declarations": [{"node": "BindingIdentifier(a)_4", "kind": "Let"}]}], "children": []}]}',
      { asScript: false }
    );
  });
});
