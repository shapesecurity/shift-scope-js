import MultiMap from 'multimap';
import reduce, { MonoidalReducer, memoize, thunkify, thunkedReduce } from 'shift-reducer';

import { Declaration, DeclarationType } from './declaration.js';
import { Accessibility, Reference } from './reference.js';
import Variable from './variable.js';
import { Scope as OrigScope, ScopeType } from './scope.js';

let parameterExpressions = wrapped => ({
  type: 'param exprs',
  wrapped,
});



export default class ScopeAnalyzer extends MonoidalReducer {
  constructor() {
    super({
      empty() {
        return null;
      },
      concat(a, b) {
        throw new Error('unreachable');
      },
    });

    this.append = (...args) => {
      let real = args.filter(a => a != null);
      if (real.length === 0) {
        return null;
      }
      if (real.length === 1) {
        return real[0];
      }
      return {
        type: 'union',
        values: real,
      };
    };
  }

  static analyze(program) {
    // return synthesize(thunkedReduce(instance, program));
    return synthesize(reduce(new ScopeAnalyzer, program));
  }

  reduceArrowExpression(node, { params, body }) {
    return {
      type: 'arrow',
      node,
      params,
      body,
    };
  }

  reduceAssignmentExpression(node, { binding, expression }) {
    return {
      type: 'assignment',
      node,
      compound: false,
      binding,
      init: expression,
    }
  }

  reduceAssignmentTargetIdentifier(node) {
    return {
      type: 'ati',
      node,
    };
  }

  reduceBindingIdentifier(node) {
    return {
      type: 'bi',
      node,
    };
  }

  reduceBindingPropertyIdentifier(node, { binding, init }) {
    const s = super.reduceBindingPropertyIdentifier(node, { binding, init });
    if (node.init != null) {
      return parameterExpressions(s);
    }
    return s;
  }

  reduceBindingPropertyProperty(node, { name, binding }) {
    const s = super.reduceBindingPropertyProperty(node, { name, binding });
    if (node.name.type === 'ComputedPropertyName') {
      return parameterExpressions(s);
    }
    return s;
  }

  reduceBindingWithDefault(node, { binding, init }) {
    return parameterExpressions(super.reduceBindingWithDefault(node, { binding, init }));
  }

  reduceBlock(node, { statements }) {
    let decls = [];
    statements.forEach(s => getBlockDecls(s, false, decls));
    return {
      type: 'block',
      node,
      statements,
      decls,
    };
  }

  reduceCallExpression(node, { callee, arguments: _arguments }) {
    const s = super.reduceCallExpression(node, { callee, arguments: _arguments });
    if (node.callee.type === 'IdentifierExpression' && node.callee.name === 'eval') {
      return {
        type: 'eval',
        wrapped: s,
      }
    }
    return s;
  }

  reduceCatchClause(node, { binding, body }) {
    return {
      type: 'catch',
      node,
      binding,
      body,
    };
  }

  reduceClassDeclaration(node, { name, super: _super, elements }) {
    return {
      type: 'class declaration',
      node,
      name,
      super: _super,
      elements,
    };
  }

  reduceClassExpression(node, { name, super: _super, elements }) {
    return {
      type: 'class expression',
      node,
      name,
      super: _super,
      elements,
    };
  }

  reduceCompoundAssignmentExpression(node, { binding, expression }) {
    return {
      type: 'assignment',
      node,
      compound: true,
      binding,
      init: expression,
    }
  }

  reduceComputedMemberExpression(node, { object, expression }) {
    return parameterExpressions(
      super.reduceComputedMemberExpression(node, { object, expression })
    );
  }

  reduceForInStatement(node, { left, right, body }) {
    let decls = [];
    getBlockDecls(left, false, decls);
    return {
      type: 'for-in/of',
      node,
      left,
      right,
      body,
      decls,
    };
  }

  reduceForOfStatement(node, { left, right, body }) {
    let decls = [];
    getBlockDecls(left, false, decls);
    return {
      type: 'for-in/of',
      node,
      left,
      right,
      body,
      decls,
    };
  }

  reduceForStatement(node, { init, test, update, body }) {
    let decls = [];
    getBlockDecls(init, false, decls);
    return {
      type: 'for',
      node,
      init,
      test,
      update,
      body,
      decls,
    };
  }

  reduceFormalParameters(node, { items, rest }) {
    return {
      type: 'parameters',
      items,
      rest,
    };
  }

  reduceFunctionBody(node, { directives, statements }) {
    let decls = [];
    statements.forEach(s => getBlockDecls(s, true, decls));
    return {
      type: 'function body',
      node,
      statements,
      decls,
    };
  }

  reduceFunctionDeclaration(node, { name, params, body }) {
    return {
      type: 'function declaration',
      node,
      name,
      params,
      body,
    };
  }

  reduceFunctionExpression(node, { name, params, body }) {
    return {
      type: 'function expression',
      node,
      name,
      params,
      body,
    };
  }

  reduceGetter(node, { name, body }) {
    return this.append(name, {
      type: 'method',
      node,
      params: {
        type: 'parameters',
        items: [],
        rest: null,
      },
      body,
    });
  }

  reduceIdentifierExpression(node) {
    return {
      type: 'ie',
      node,
    };
  }

  // we need 'if' so we can check if its consequent/alternate are function declarations for b.3.3
  reduceIfStatement(node, { test, consequent, alternate }) {
    return {
      type: 'if',
      node,
      test,
      consequent,
      alternate,
    };
  }

  reduceImport(node, { moduleSpecifier, defaultBinding, namedImports }) {
    return {
      type: 'import',
      node,
      defaultBinding,
      namedImports,
    };
  }

  reduceMethod(node, { name, params, body }) {
    return this.append(name, {
      type: 'method',
      node,
      params,
      body,
    });
  }

  reduceModule(node, { directives, items }) {
    let decls = [];
    items.forEach(s => getBlockDecls(s, true, decls));
    return {
      type: 'module',
      node,
      items,
      decls,
    };
  }

  reduceScript(node, { directives, statements }) {
    let decls = [];
    statements.forEach(s => getBlockDecls(s, true, decls));
    return {
      type: 'script',
      node,
      directives,
      statements,
      decls,
    };
  }

  reduceSetter(node, { name, param, body }) {
    return this.append(name, {
      type: 'method',
      node,
      params: {
        type: 'parameters',
        items: [param],
        rest: null,
      },
      body,
    });
  }

  reduceSwitchStatement(node, { discriminant, cases }) {
    let decls = [];
    cases.forEach(s => getBlockDecls(s, false, decls));
    return {
      type: 'switch',
      node,
      discriminant,
      cases,
      decls,
    };
  }

  reduceSwitchStatementWithDefault(node, { discriminant, preDefaultCases, defaultCase, postDefaultCases }) {
    // todo maybe just spread like a normal person
    const cases = preDefaultCases.concat([defaultCase], postDefaultCases);
    let decls = [];
    cases.forEach(s => getBlockDecls(s, false, decls));
    return {
      type: 'switch',
      node,
      discriminant,
      cases,
      decls,
    };
  }

  reduceUnaryExpression(node, { operand }) {
    if (node.operator === 'delete' && node.operand.type === 'IdentifierExpression') {
      // 'delete x' is a special case.
      return {
        type: 'delete',
        node,
        operand,
      };
    }
    return super.reduceUnaryExpression(node, { operand });
  }

  reduceUpdateExpression(node, { operand }) {
    return {
      type: 'update',
      node,
      operand,
    };
  }

  reduceVariableDeclaration(node, { declarators }) {
    return {
      type: 'variable declaration',
      node,
      declarators,
    };
  }

  reduceVariableDeclarator(node, { binding, init }) {
    // TODO maybe more logic here, for omitted init?
    return {
      type: 'variable declarator',
      node,
      binding,
      init,
    };
  }

  reduceWithStatement(node, { object, body }) {
    return {
      type: 'with',
      node,
      object,
      body,
    };
  }
}

function isStrict(node) {
  return node.directives.some(d => d.rawValue === 'use strict');
}

function getAssignmentTargetIdentifiers(item, out) {
  if (item == null) {
    return;
  }
  switch (item.type) {
    case 'ati': {
      out.push(item.node);
      break;
    }
    case 'union': {
      item.values.forEach(v => {
        getAssignmentTargetIdentifiers(v, out);
      });
      break;
    }
    case 'param exprs': {
      getAssignmentTargetIdentifiers(item.wrapped, out);
      break;
    }
    case 'assignment':
    case 'arrow':
    case 'method':
    case 'eval':
    case 'update':
    case 'delete':
    case 'class expression':
    case 'function expression':
    case 'variable declaration':
    case 'ie': {
      break;
    }
    default: {
      throw new Error('unimplemented: getAssignmentTargetIdentifiers type ' + item.type);
    }
  }
}

// TODO do this during initial pass probably
// TODO reconsider out parameter
// returns `true` if there are parameter expresisons
function getBindings(item, out) {
  if (item == null) {
    return false;
  }
  switch (item.type) {
    case 'union': {
      return item.values.map(v => getBindings(v, out)).some(e => e);
      break;
    }
    case 'bi': {
      out.push(item.node);
      return false;
      break;
    }
    case 'param exprs': {
      getBindings(item.wrapped, out);
      return true;
      break;
    }
    // TODO enumerate cases somewhere probably
    case 'arrow':
    case 'assignment':
    case 'method':
    case 'eval':
    case 'update':
    case 'delete':
    case 'class expression':
    case 'function expression':
    case 'ie': {
      return false;
      break;
    }
    default: {
      throw new Error('unimplemented: getBindings type ' + item.type);
    }
  }
}

function getBlockDecls(item, isTopLevel, out) {
  if (item == null) {
    return;
  }
  switch (item.type) {
    case 'variable declaration': {
      if (item.node.kind === 'const' || item.node.kind === 'let') {
        item.declarators.forEach(d => {
          let decls = [];
          getBindings(d.binding, decls);

          decls.forEach(d => {
            out.push(new Declaration(d, DeclarationType.fromVarDeclKind(item.node.kind)));
          });
        });
      }
      break;
    }
    case 'class declaration': {
      if (item.node.name.name !== '*default*') {
        out.push(new Declaration(item.node.name, DeclarationType.CLASS_DECLARATION));
      }
      break;
    }
    case 'function declaration': {
      if (!isTopLevel) {
        out.push(new Declaration(item.node.name, DeclarationType.FUNCTION_DECLARATION));
      }
      break;
    }
    case 'import': {
      let decls = [];
      getBindings(item.defaultBinding, decls);
      // TODO we don't actually need to bother recurring here
      item.namedImports.forEach(n => getBindings(n, decls));

      decls.forEach(d => {
        out.push(new Declaration(d, DeclarationType.IMPORT));
      });

      break;
    }
    case 'union': {
      item.values.forEach(v => getBlockDecls(v, false, out));
      break;
    }
    case 'param exprs': {
      getBlockDecls(item.wrapped, false, out);
      break;
    }

    // TODO enumerate cases somewhere probably
    // man, typescript would be nice
    case 'catch':
    case 'switch':
    case 'arrow':
    case 'eval':
    case 'for-in/of':
    case 'for':
    case 'assignment':
    case 'update':
    case 'delete':
    case 'method':
    case 'class expression':
    case 'function expression':
    case 'if':
    case 'ie':
    case 'ati':
    case 'with':
    case 'block': {
      break;
    }
    default: {
      throw new Error('unimplemented: getBlockDecls type ' + item.type);
    }
  }
}

function getVarDecls(item, strict, forbiddenB33DeclsStack, isTopLevel, outVar, outB33) {
  if (item == null) {
    return;
  }
  switch (item.type) {
    case 'variable declaration': {
      if (item.node.kind === 'var') {
        item.declarators.forEach(d => {
          let decls = [];
          getBindings(d.binding, decls);

          decls.forEach(d => {
            outVar.push(new Declaration(d, DeclarationType.VAR));
          });
        });
      }
      break;
    }
    case 'block': {
      forbiddenB33DeclsStack.push(item.decls);
      item.statements.forEach(s => getVarDecls(s, strict, forbiddenB33DeclsStack, false, outVar, outB33));
      forbiddenB33DeclsStack.pop();
      break;
    }
    case 'function declaration': {
      let name = item.node.name.name;
      if (name === '*default*') {
        break;
      }
      if (isTopLevel) {
        outVar.push(new Declaration(item.node.name, DeclarationType.FUNCTION_DECLARATION));
        break;
      }
      if (strict || item.node.isGenerator || item.node.isAsync || forbiddenB33DeclsStack.some(ds => ds.some(d => d.node !== item.node.name && d.node.name === name))) {
        break;
      }
      outB33.push(new Declaration(item.node.name, DeclarationType.FUNCTION_VAR_DECLARATION));
      break;
    }
    case 'if': {
      getVarDecls(item.consequent, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      getVarDecls(item.alternate, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      break;
    }
    case 'union': {
      // TODO I think we can just return here; `union` should basically only be for like `a + b`;
      // j/k it's used for switch cases. TODO ensure `switch (x) { case a: function f(){} function g(){} }` is tested.
      item.values.forEach(v => getVarDecls(v, strict, forbiddenB33DeclsStack, false, outVar, outB33));
      break;
    }
    case 'catch': {
      let complexBinding = item.node.binding.type !== 'BindingIdentifier';
      if (complexBinding) {
        // trivial catch bindings don't block B33 hoisting, but non-trivial ones do
        // see https://tc39.es/ecma262/#sec-variablestatements-in-catch-blocks

        // TODO move up
        let bindings = [];
        getBindings(item.binding, bindings);

        forbiddenB33DeclsStack.push(bindings.map(b => new Declaration(b, DeclarationType.CATCH)));
      }
      getVarDecls(item.body, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      if (complexBinding) {
        forbiddenB33DeclsStack.pop();
      }
      break;
    }
    case 'with': {
      getVarDecls(item.body, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      break;
    }
    case 'for': {
      forbiddenB33DeclsStack.push(item.decls);
      getVarDecls(item.init, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      getVarDecls(item.body, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      forbiddenB33DeclsStack.pop();
      break;
    }
    case 'for-in/of': {
      forbiddenB33DeclsStack.push(item.decls);
      getVarDecls(item.left, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      getVarDecls(item.body, strict, forbiddenB33DeclsStack, false, outVar, outB33);
      forbiddenB33DeclsStack.pop();
      break;
    }
    case 'switch': {
      forbiddenB33DeclsStack.push(item.decls);
      item.cases.forEach(c => getVarDecls(c, strict, forbiddenB33DeclsStack, false, outVar, outB33));
      forbiddenB33DeclsStack.pop();
      break;
    }
    case 'param exprs':
    case 'import':
    case 'arrow':
    case 'eval':
    case 'method':
    case 'function expression':
    case 'class expression':
    case 'update':
    case 'delete':
    case 'assignment':
    case 'ati':
    case 'ie':
    case 'class declaration': {
      break;
    }
    default: {
      throw new Error('unimplemented: getVarDecls type ' + item.type);
    }
  }
}

// TODO
class Scope {
  constructor(o) {
    o.dynamic = o.isDynamic;
    o.variableMap = new Map;
    return o;
  }
}

function synthesize(summary) {
  let strict = false;

  // map string => [{ scope, variable }]
  let namesInScope = new Map;

  let scopeStack = [];

  function enterScope(type, node) {
    let scope = new Scope({
      type,
      astNode: node,
      children: [],
      variables: [],
      isDynamic: type === ScopeType.WITH,
      through: new MultiMap(),
    });
    scopeStack[scopeStack.length - 1].children.push(scope);
    scopeStack.push(scope);
  }

  function exitScope() {
    let scope = scopeStack.pop();
    scope.variables.forEach(v => {
      namesInScope.get(v.name).pop();
    });
  }

  function refer(accessibility, node) {
    let name = node.name;

    let ref = new Reference(node, accessibility);
    if (!namesInScope.has(name) || namesInScope.get(name).length === 0) {

      // make a new global
      let variable = new Variable(name, [], []);
      scopeStack[0].variables.push(variable);
      scopeStack[0].variableMap.set(name, variable);
      namesInScope.set(name, [{ scope: scopeStack[0], variable }]);

    }

    let stack = namesInScope.get(name);
    let { scope, variable } = stack[stack.length - 1];
    variable.references.push(ref);
    for (let i = scopeStack.length - 1; scopeStack[i] !== scope; --i) {
      scopeStack[i].through.set(name, ref);
    }

    // we consider references to undeclared global variables to pass through the global scope
    if (scope === scopeStack[0] && variable.declarations.length === 0) {
      scopeStack[0].through.set(name, ref);
    }
  }

  // you can declare 'arguments' by invoking this with `null`
  function declare(decl) {
    let scope = scopeStack[scopeStack.length - 1];
    let name = decl == null ? 'arguments' : decl.node.name;
    if (scope.variableMap.has(name)) {
      if (decl != null) {
        scope.variableMap.get(name).declarations.push(decl);
      }
    } else {
      let variable = new Variable(name, [], decl == null ? [] : [decl]);
      scope.variables.push(variable);
      scope.variableMap.set(name, variable);
      if (!namesInScope.has(name)) {
        namesInScope.set(name, []);
      }
      namesInScope.get(name).push({ scope, variable });
    }
  }

  function func(node, paramNodes, paramsItem, body) {
    let oldStrict = strict;
    strict = strict || (node.body.type === 'FunctionBody' && isStrict(node.body));

    let arrow = node.type === 'ArrowExpression';

    let bindings = [];
    let paramExprs = paramsItem.items.map(i => getBindings(i, bindings))
    let hasParameterExpressions = paramExprs.some(b => b);
    let restHasParamExprs = false;
    if (paramsItem.rest != null) {
      restHasParamExprs = getBindings(paramsItem.rest, bindings);
      hasParameterExpressions = hasParameterExpressions || restHasParamExprs;
    }

    let params = bindings.map(b => new Declaration(b, DeclarationType.PARAMETER));

    let paramScope = hasParameterExpressions ? enterScope(ScopeType.PARAMETERS, node) : null;

    if (hasParameterExpressions) {
      if (!arrow) {
        declare(null);
      }
      params.forEach(declare);
      for (let i = 0; i < paramNodes.items.length; ++i) {
        if (paramExprs[i]) {
          // each parameter with expressions gets its own scope
          // fortunately they have no declarations
          enterScope(ScopeType.PARAMETER_EXPRESSION, paramNodes.items[i]);
          visit(paramsItem.items[i]);
          exitScope();
        } else {
          visit(paramsItem.items[i]);
        }
      }
      if (paramNodes.rest != null) {
        if (restHasParamExprs) {
          enterScope(ScopeType.PARAMETER_EXPRESSION, paramNodes.rest);
          visit(paramsItem.rest);
          exitScope();
        } else {
          visit(paramsItem.rest);
        }
      }
    }

    let functionScope = enterScope(arrow ? ScopeType.ARROW_FUNCTION : ScopeType.FUNCTION, node);

    if (arrow && node.body.type !== 'FunctionBody') {
      if (!hasParameterExpressions) {
        params.forEach(declare);
      }
    } else {
      if (!hasParameterExpressions) {
        if (!arrow) {
          declare(null);
        }
        params.forEach(declare);
      }

      let vs = [];
      // TODO b33vs probably doesn't need to be its own array
      let b33vs = [];

      body.statements.forEach(s => getVarDecls(s, strict, [params, body.decls], true, vs, b33vs));

      body.decls.forEach(declare);
      vs.forEach(declare);
      b33vs.forEach(declare);
    }

    visit(body);


    exitScope();

    if (hasParameterExpressions) {
      exitScope();
    }
    strict = oldStrict;
  }

  function visit(item) {
    if (item == null) {
      return;
    }
    switch (item.type) {
      case 'script': {
        strict = isStrict(item.node);

        // TODO b33vs probably doesn't need to be its own array

        // top-level lexical declarations in scripts are not globals, so first create the global scope for the var-scoped things
        let globalScope = new Scope({
          type: ScopeType.GLOBAL,
          astNode: item.node,
          children: [],
          variables: [],
          isDynamic: true, // the global scope is always dynamic
          // TODO contemplate `through`
          through: new MultiMap(),
        });
        scopeStack.push(globalScope);

        let vs = [];
        let b33vs = [];
        item.statements.forEach(s => getVarDecls(s, strict, [item.decls], true, vs, b33vs));

        vs.forEach(declare);
        b33vs.forEach(declare);

        enterScope(ScopeType.SCRIPT, item.node);

        item.decls.forEach(declare);

        item.statements.forEach(visit);

        // no particular reason to bother popping stacks
        break;
      }
      case 'module': {
        strict = true;

        // no declarations in a module are global, but there is still a global scope
        let globalScope = new Scope({
          type: ScopeType.GLOBAL,
          astNode: item.node,
          children: [],
          variables: [],
          isDynamic: true, // the global scope is always dynamic
          through: new MultiMap(),
        });
        scopeStack.push(globalScope);

        enterScope(ScopeType.MODULE, item.node);

        let vs = [];
        item.items.forEach(s => getVarDecls(s, strict, [item.decls], true, vs, []));

        item.decls.forEach(declare);
        vs.forEach(declare);

        item.items.forEach(visit);

        // no particular reason to bother popping stacks
        break;
      }
      case 'variable declaration': {
        item.declarators.forEach(visit);
        break;
      }
      case 'variable declarator': {
        if (item.node.init != null) {
          // TODO do the getBindings during the inital tree walk
          let bindings = [];
          getBindings(item.binding, bindings);
          bindings.forEach(b => {
            refer(Accessibility.WRITE, b);
          });
        }

        visit(item.binding);
        visit(item.init);

        break;
      }
      case 'block': {
        enterScope(ScopeType.BLOCK, item.node);

        item.decls.forEach(declare);

        item.statements.forEach(visit);

        exitScope();
        break;
      }
      case 'class expression':
      case 'class declaration': {
        let oldStrict = strict;
        strict = true;

        enterScope(ScopeType.CLASS_NAME, item.node);

        let hasName =
          item.type == 'class expression'
            ? item.node.name != null
            : item.node.name.name !== '*default*';

        if (hasName) {
          declare(new Declaration(item.node.name, DeclarationType.CLASS_NAME));
        }

        visit(item.super);
        item.elements.forEach(visit);

        exitScope();

        strict = oldStrict;
        break;
      }
      case 'function declaration': {
        func(item.node, item.node.params, item.params, item.body);
        break;
      }
      case 'function expression': {
        if (item.node.name != null) {
          enterScope(ScopeType.FUNCTION_NAME, item.node);

          declare(new Declaration(item.node.name, DeclarationType.FUNCTION_NAME));

          func(item.node, item.node.params, item.params, item.body);

          exitScope();
        } else {
          func(item.node, item.node.params, item.params, item.body);
        }
        break;
      }
      case 'arrow': {
        func(item.node, item.node.params, item.params, item.body);
        break;
      }
      case 'method': {
        let paramNodes = item.node.type === 'Method'
          ? item.node.params
          : item.node.type === 'Setter'
            ? { items: [item.node.param], rest: null }
            : { items: [], rest: null };
        func(item.node, paramNodes, item.params, item.body);
        break;
      }
      case 'with': {
        visit(item.object);
        enterScope(ScopeType.WITH, item.node);

        visit(item.body);

        exitScope();
        break;        
      }
      case 'catch': {
        enterScope(ScopeType.CATCH, item.node);

        // TODO move up
        let bindings = [];
        getBindings(item.binding, bindings);

        // todo not map + foreach
        bindings.map(b => new Declaration(b, DeclarationType.CATCH_PARAMETER)).forEach(declare);

        visit(item.binding);
        visit(item.body);

        exitScope();
        break;
      }
      case 'for': {
        enterScope(ScopeType.BLOCK, item.node);

        item.decls.forEach(declare);

        visit(item.init);
        visit(item.test);
        visit(item.update);
        visit(item.body);

        exitScope();

        break;
      }
      case 'for-in/of': {
        enterScope(ScopeType.BLOCK, item.node);

        item.decls.forEach(declare);

        // TODO be less dumb about this
        // ideally do it earlier
        if (item.left != null) {
          let bindings = [];
          if (item.left.type === 'variable declaration') {
            item.left.declarators.forEach(d => getBindings(d.binding, bindings));
          } else {
            getAssignmentTargetIdentifiers(item.left, bindings);
          }
          bindings.forEach(b => {
            refer(Accessibility.WRITE, b);
          });
        }

        visit(item.left);
        visit(item.right);
        visit(item.body);

        exitScope();

        break;
      }
      case 'switch': {
        visit(item.discriminant);

        enterScope(ScopeType.BLOCK, item.node);
        item.decls.forEach(declare);

        item.cases.forEach(visit);

        exitScope();

        break;
      }
      case 'if': {
        visit(item.test);
        // These "blocks" are synthetic; see https://tc39.es/ecma262/#sec-functiondeclarations-in-ifstatement-statement-clauses
        if (item.node.consequent.type === 'FunctionDeclaration') {
          enterScope(ScopeType.BLOCK, item.node.consequent);
          declare(new Declaration(item.node.consequent.name, DeclarationType.FUNCTION_DECLARATION));

          visit(item.consequent);

          exitScope();
        } else {
          visit(item.consequent);
        }
        if (item.alternate != null) {
          if (item.node.alternate.type === 'FunctionDeclaration') {
            enterScope(ScopeType.BLOCK, item.node.alternate);
            declare(new Declaration(item.node.alternate.name, DeclarationType.FUNCTION_DECLARATION));

            visit(item.alternate);

            exitScope();
          } else {
            visit(item.alternate);
          }
        }
        break;
      }
      case 'parameters': {
        item.items.forEach(visit);
        if (item.rest != null) {
          visit(item.rest);
        }
        break;
      }
      // TODO revisit having function body represented
      case 'function body': {
        item.statements.forEach(visit);
        break;
      }
      case 'assignment': {
        let bindings = [];

        if (item.node.binding.type === 'AssignmentTargetIdentifier') {
          let accessibility = item.compound ? Accessibility.READWRITE : Accessibility.WRITE;
          refer(accessibility, item.node.binding);
        } else {
          getAssignmentTargetIdentifiers(item.binding, bindings);
          bindings.forEach(b => {
            refer(Accessibility.WRITE, b);
          });
        }

        visit(item.binding);
        visit(item.init);

        break;
      }
      case 'update': {
        if (item.node.operand.type === 'AssignmentTargetIdentifier') {
          refer(Accessibility.READWRITE, item.node.operand);
        } else {
          visit(item.operand);
        }
        break;
      }
      case 'ie': {
        refer(Accessibility.READ, item.node);
        break;
      }
      case 'delete': {
        refer(Accessibility.DELETE, item.node.operand);
        break;
      }
      case 'param exprs': {
        // TODO
        visit(item.wrapped);
        break;
      }
      case 'union': {
        item.values.forEach(visit);
        break;
      }
      case 'eval': {
        // TODO this is useless / actively harmful
        scopeStack[scopeStack.length - 1].dynamic = true;
        visit(item.wrapped);
        break;
      }
      case 'import':
      case 'ati':
      case 'bi': {
        break;
      }
      default: {
        throw new Error('unimplemented: visit type ' + item.type);
      }
    }
  }

  visit(summary);

  // ugh
  function visitScope(scope) {
    let variables = scope.variables;
    scope.variables = scope.variableMap;
    delete scope.variableMap;

    scope.variableList = [];
    for (let x of variables) {
      scope.variableList.push(x);
    }

    scope.lookupVariable = name => scope.variables.get(name);

    for (let child of scope.children) {
      visitScope(child);
    }
  }
  visitScope(scopeStack[0]);

  return scopeStack[0];
}

let instance = memoize(thunkify(new ScopeAnalyzer));
