/**
 * Copyright 2017 Shape Security, Inc.
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

function insertInto(annotations, index, text, afterExisting) {
  for (let i = 0; i < annotations.length; ++i) {
    if (annotations[i].index >= index) {
      if (afterExisting) {
        while (i < annotations.length && annotations[i].index === index) {
          ++i;
        }
      }

      annotations.splice(i, 0, { index, text });
      return;
    }
  }
  annotations.push({ index, text });
}

class Info {
  constructor() {
    this.declares = [];
    this.reads = [];
    this.writes = [];
    this.deletes = [];
    this.scopes = [];
  }
}

class DefaultMap extends Map {
  constructor(thunk) {
    super();
    this.thunk = thunk;
  }

  get(v) {
    if (!this.has(v)) {
      this.set(v, this.thunk());
    }
    return super.get(v);
  }
}

module.exports = function annotate({ source, locations, globalScope, skipUnambiguous = false, skipScopes = false }) {

  const nodeInfo = new DefaultMap(() => new Info);

  const vars = new DefaultMap(() => []); // MultiMap, I guess?

  function addVariable(v) {
    vars.get(v.name).push(v);
    v.declarations.forEach(d => {
      nodeInfo.get(d.node).declares.push(v);
    });
    v.references.forEach(r => {
      let info = nodeInfo.get(r.node);
      if (r.accessibility.isDelete) {
        if (r.accessibility.isRead || r.accessibility.isWrite) {
          throw new Error('some reference is a delete *and* something else');
        }
        info.deletes.push(v);
      } else {
        if (r.accessibility.isRead) {
          info.reads.push(v);
        }
        if (r.accessibility.isWrite) {
          info.writes.push(v);
        }
      }
    });
  }

  (function visit(scope) {
    if (!skipScopes) nodeInfo.get(scope.astNode).scopes.push(scope);
    scope.variables.forEach(addVariable);
    scope.children.forEach(visit);
  }(globalScope));


  // an annotation is { index, text }
  const annotations = [];

  for (let [node, info] of nodeInfo.entries()) {
    const location = locations.get(node);
    if (info.scopes.length > 0) {
      if (info.declares.length !== 0 || info.reads.length !== 0 || info.writes.length !== 0 || info.deletes.length !== 0) {
        throw new Error('unhandled condition: node is scope and reference');
      }
      for (let scope of [...info.scopes]) {
        let scopeVars = [...scope.variables.values()];
        let text = 'Scope (' + scope.type.name + ')';
        if (scopeVars.length > 0) {
          text += ' declaring ' + scopeVars.map(v => v.name + '#' + vars.get(v.name).indexOf(v)).join(', ');
        }
        insertInto(annotations, location.start.offset, '/* ' + text + ' */', true);
        insertInto(annotations, location.end.offset, '/* end scope */', true);
      }
    } else if (info.deletes.length > 0) {
      let deletes = skipUnambiguous ? info.deletes.filter(v => vars.get(v.name).length > 1) : info.deletes;
      if (deletes.length > 0) {
        insertInto(annotations, location.end.offset, '/* deletes ' + deletes.map(v => v.name + '#' + vars.get(v.name).indexOf(v)).join(', ') + ' */', false);
      }
    } else {
      let text = '';
      let declares = skipUnambiguous ? info.declares.filter(v => vars.get(v.name).length > 1) : info.declares;
      if (declares.length > 0) {
        text += 'declares ' + declares.map(v => v.name + '#' + vars.get(v.name).indexOf(v)).join(', ');
      }
      let reads = skipUnambiguous ? info.reads.filter(v => vars.get(v.name).length > 1) : info.reads;
      if (reads.length > 0) {
        if (text.length > 0) text += '; ';
        text += 'reads ' + reads.map(v => v.name + '#' + vars.get(v.name).indexOf(v)).join(', ');
      }
      let writes = skipUnambiguous ? info.writes.filter(v => vars.get(v.name).length > 1) : info.writes;
      if (writes.length > 0) {
        if (text.length > 0) text += '; ';
        text += 'writes ' + writes.map(v => v.name + '#' + vars.get(v.name).indexOf(v)).join(', ');
      }
      if (text !== '') {
        insertInto(annotations, location.end.offset, '/* ' + text + ' */', false);
      }
    }
  }

  let out = '';
  let previousIndex = 0;
  for (let { index, text } of annotations) {
    out += source.substring(previousIndex, index) + text;
    previousIndex = index;
  }
  out += source.substring(previousIndex);
  return out;
};
