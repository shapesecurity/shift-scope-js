const { reduce, MonoidalReducer } = require('shift-reducer');

// TODO this file should live elsewhere

class SetMonoid { // nb not immutable
  constructor(set) {
    this.set = set;
  }

  static empty() {
    return new SetMonoid(new Set);
  }

  concat(b) {
    return new SetMonoid(merge(this.set, b.set));
  }

  extract() {
    return this.set;
  }

  add(e) {
    // this happens to work, since, as used in StrictnessReducer, .add is never called until after something has been merged, so the identity element is never mutated.
    // to do this in an immutable fashion, uncomment the line below. 
    // this.set = merge(new Set, this.set);
    this.set.add(e);
    return this;
  }
}

function hasStrict(directives) {
  return directives.some(d => d.rawValue === 'use strict');
}

function merge(s1, s2) {
  let out = new Set;
  s1.forEach(v => out.add(v));
  s2.forEach(v => out.add(v));
  return out;
}

// Given a Script, the analyze method returns a set containing all ArrowExpression, FunctionDeclaration, FunctionExpression, and Script nodes which are sloppy mode. All other ArrowExpression, FunctionDeclaration, FunctionExpression, and Script nodes are strict.
module.exports = class StrictnessReducer extends MonoidalReducer {
  constructor() {
    super(SetMonoid);
  }

  static analyze(script) {
    return reduce(new this, script).extract();
  }

  reduceArrowExpression(node, { params, body }) {
    if (node.body.type === 'FunctionBody' && hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceArrowExpression(node, { params, body }).add(node);
  }

  reduceClassDeclaration() {
    return SetMonoid.empty();
  }

  reduceClassExpression() {
    return SetMonoid.empty();
  }

  reduceFunctionDeclaration(node, { name, params, body }) {
    if (hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceFunctionDeclaration(node, { name, params, body }).add(node);
  }

  reduceFunctionExpression(node, { name, params, body }) {
    if (hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceFunctionExpression(node, { name, params, body }).add(node);
  }

  reduceGetter(node, { name, body }) {
    if (hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceGetter(node, { name, body }).add(node);
  }

  reduceMethod(node, { name, params, body }) {
    if (hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceMethod(node, { name, params, body }).add(node);
  }

  reduceScript(node, { directives, statements }) {
    if (hasStrict(node.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceScript(node, { directives, statements }).add(node);
  }

  reduceSetter(node, { name, param, body }) {
    if (hasStrict(node.body.directives)) {
      return SetMonoid.empty();
    }
    return super.reduceSetter(node, { name, param, body }).add(node);
  }
};
