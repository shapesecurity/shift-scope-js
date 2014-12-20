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

export class DeclarationType {
  constructor(name, isBlockScoped) {
    this.name = name;
    this.isBlockScoped = !!isBlockScoped;
    this.isFunctionScoped = !isBlockScoped;
  }
}

export class BlockScopedDeclaration extends DeclarationType {
  constructor(name) {
    super(name, true);
  }
}

export class FunctionScopedDeclaration extends DeclarationType {
  constructor(name) {
    super(name, false);
  }
}

DeclarationType.VAR = new FunctionScopedDeclaration("var");
DeclarationType.CONST = new BlockScopedDeclaration("const");
DeclarationType.LET = new BlockScopedDeclaration("let");
DeclarationType.FUNCTION_NAME = new FunctionScopedDeclaration("function name");
DeclarationType.PARAMETER = new FunctionScopedDeclaration("parameter");
DeclarationType.CATCH = new BlockScopedDeclaration("catch");

export class Declaration {
  constructor(node, kind) {
    this.node = node;
    this.kind = kind;
  }

  static fromVarDeclKind(node, variableDeclarationKind) {
    switch (variableDeclarationKind) {
    case "var":
      return new VarDeclaration(node);
    case "const":
      return new ConstDeclaration(node);
    case "let":
      return new LetDeclaration(node);
    default:
      throw new Error("Invalid VariableDeclarationKind: " + JSON.stringify(variableDeclarationKind));
    }
  }
}

export class VarDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.VAR);
  }
}

export class ConstDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.CONST);
  }
}

export class LetDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.LET);
  }
}

export class FunctionNameDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.FUNCTION_NAME);
  }
}

export class ParameterDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.PARAMETER);
  }
}

export class CatchDeclaration extends Declaration {
  constructor(node) {
    super(node, DeclarationType.CATCH);
  }
}
