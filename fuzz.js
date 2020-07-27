const assert = require('assert');

const expect = require('chai').expect;

const { parseScript } = require('shift-parser');
const fuzz = require('shift-fuzzer').fuzzScript;
const codegen = require('shift-codegen').default;

const analyze = require('.').default;
const ScopeAnalyzer = require('./dist/scope-analyzer-two.js').default;

const serialize = require('.').serialize;





function assertReferenceEquals(a, b) {
  assert.strictEqual(a.node, b.node);
  assert.strictEqual(a.accessibility, b.accessibility);
}

function assertDeclarationEquals(a, b) {
  assert.strictEqual(a.node, b.node);
  assert.strictEqual(a.type, b.type);
}

function assertVariableEquals(a, b) {
  assert.strictEqual(a.name, b.name);

  assert.strictEqual(a.declarations.length, b.declarations.length);
  for (let i = 0; i < a.declarations.length; ++i) {
    assertDeclarationEquals(a.declarations[i], b.declarations[i]);
  }

  assert.strictEqual(a.references.length, b.references.length, a.name + ' references');
  for (let i = 0; i < a.references.length; ++i) {
    assertReferenceEquals(a.references[i], b.references[i]);
  }
}

function assertScopeEquals(a, b) {
  // assert.deepEqual(JSON.parse(serialize(a)), JSON.parse(serialize(b)));
  let sa = JSON.parse(serialize(a));
  let sb = JSON.parse(serialize(b));

  function clean(scope) {
    function idNode(node) {
      return parseInt(node.match(/_(\d+)$/)[1]);
    }

    scope.variables.forEach(v => {
      v.declarations = v.declarations.sort((a, b) => {
        let aidx = idNode(a.node);
        let bidx = idNode(b.node);
        return aidx - bidx;
      });

      v.references = v.references.sort((a, b) => {
        let aidx = idNode(a.node);
        let bidx = idNode(b.node);
        return aidx - bidx;
      });
    });

    scope.children = scope.children.sort((a, b) => {
      let aidx = idNode(a.node);
      let bidx = idNode(b.node);
      return aidx - bidx;
    });

    scope.children.forEach(clean);
  }
  clean(sa);
  clean(sb);


  let ac = sa.children;
  let bc = sb.children;
  // delete sa.children;
  // delete sb.children;
  // expect(sa).to.deep.equal(sb);

  expect(JSON.stringify(sb, null, 2)).to.deep.equal(JSON.stringify(sa, null, 2));

  return;


  assert.strictEqual(a.type, b.type);
  assert.strictEqual(a.astNode, b.astNode);
  assert.strictEqual(a.dynamic, b.dynamic);
  assert.strictEqual(a.variableList.length, b.variableList.length);

  let al = a.variableList.sort((x, y) => x.name.localeCompare(y.name));
  let bl = b.variableList.sort((x, y) => x.name.localeCompare(y.name));
  for (let i = 0; i < a.variableList.length; ++i) {
    assertVariableEquals(al[i], bl[i]);
  }

  // todo children, etc
}

let oldTimes = [];
let newTimes = [];

it('foo', function () {
  this.timeout(200000);
  for (let i = 0; i < 10000; ++i) {

    let script = codegen(fuzz());

    // script = require('fs').readFileSync('fail.js', 'utf8');

    let tree = parseScript(script, { earlyErrors: false });



    try {
      let start = process.hrtime();
      let oldS = analyze(tree);
      let end = process.hrtime(start);
      oldTimes.push(end[0] * 1e6 + end[1] / 1e3);

      start = process.hrtime()
      let newS = ScopeAnalyzer.analyze(tree);
      end = process.hrtime(start);
      newTimes.push(end[0] * 1e6 + end[1] / 1e3);

      // console.log(require('util').inspect(newS, { depth: null }));
      // return;

      // assertScopeEquals(oldS, newS);
    } catch (e) {
      require('fs').writeFileSync('fail.js', script, 'utf8');
      throw e;
    }
  }

  console.log(require('summary-statistics')(oldTimes))
  console.log(require('summary-statistics')(newTimes))
});
