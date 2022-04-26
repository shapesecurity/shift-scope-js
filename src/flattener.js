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

const { reduce, MonoidalReducer } = require('shift-reducer');
const ShiftSpec = require('shift-spec');

// TODO this file should live elsewhere

class ListMonoid {
  constructor(list) {
    this.list = list;
  }

  static empty() {
    return new ListMonoid([]);
  }

  concat(b) {
    return new ListMonoid(this.list.concat(b.list));
  }

  extract() {
    return this.list;
  }
}

// Gives a flat list of all nodes rooted at the given node, in preorder: that is, a node appears before its children.
class Flattener extends MonoidalReducer { // We explicitly invoke Monoidal.prototype methods so that we can automatically generate methods from the spec.
  constructor() {
    super(ListMonoid);
  }

  static flatten(node) {
    return reduce(new this, node).extract();
  }
}

for (let typeName of Object.keys(ShiftSpec)) {
  Object.defineProperty(Flattener.prototype, `reduce${typeName}`, {
    value(node, state) {
      return (new ListMonoid([node])).concat(MonoidalReducer.prototype[`reduce${typeName}`].call(this, node, state));
    },
  });
}

module.exports = Flattener;
