import parse from "shift-parser";
import analyzeScope, {ScopeType, DeclarationType} from "shift-scope";

let program = `
function functionNameA(parameter) {
  let uninitialisedA;
  uninitialisedA;

  let uninitialisedB;

  let initialised = 0;
  initialised;

  let assigned;
  assigned = 0;
  assigned;

  let reassignedA = 0;
  reassignedA = 0;

  let reassignedB;
  reassignedB = 0;
  reassignedB = 0;

  let mutatedA = 0;
  mutatedA++;

  let mutatedB = 0;
  --mutatedB;

  try {} catch (catchA) { catchA = 0; }
  try {} catch (catchB) {}

  arguments = 0;
  parameter = 0;

  functionNameA = 0;

  function functionNameB() {}
  functionNameB = 0;

  (function functionNameC() {
    functionNameC = 0;
  });
}
`;

let globalScope = analyzeScope(parse(program));

function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

// determine if a variable has an implicit initial value
function declarationImpliesInitialisation(variable, scope) {
  return variable.name === "arguments" && scope.type === ScopeType.FUNCTION ||
    variable.declarations.some(decl =>
      decl.kind === DeclarationType.PARAMETER ||
      decl.kind === DeclarationType.FUNCTION_NAME ||
      decl.kind === DeclarationType.CATCH
    );
}

function constViolations(scope) {
  return scope.variableList.filter(variable => {
    let writeReferences = variable.references.filter(ref => ref.accessibility.isWrite);
    if (declarationImpliesInitialisation(variable, scope)) {
      return writeReferences.length > 0;
    } else {
      return writeReferences.length > 1 || writeReferences.length < 1 && variable.references.length > 0;
    }
  }).concat(flatten(scope.children.map(constViolations)));
}

// TODO: pull out the write references of these variables and report their nodes' source locations
console.dir(constViolations(globalScope).sort((a, b) => a.name > b.name ? 1 : -1));
