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

class DeclarationType {
  constructor(name, isBlockScoped) {
    this.name = name;
    this.isBlockScoped = !!isBlockScoped;
    this.isFunctionScoped = !isBlockScoped;
  }
}

class BlockScopedDeclaration extends DeclarationType {
  constructor(name) {
    super(name, true);
  }
}

class FunctionScopedDeclaration extends DeclarationType {
  constructor(name) {
    super(name, false);
  }
}

DeclarationType.VAR = new FunctionScopedDeclaration('Var');
DeclarationType.CONST = new BlockScopedDeclaration('Const');
DeclarationType.LET = new BlockScopedDeclaration('Let');
DeclarationType.FUNCTION_DECLARATION = new BlockScopedDeclaration('FunctionDeclaration'); // potentially also `FunctionScoped` versions of this, for functions at top of functions/etc?
DeclarationType.FUNCTION_VAR_DECLARATION = new FunctionScopedDeclaration('FunctionB33'); // The additional variable created by B.3.3.
DeclarationType.FUNCTION_NAME = new BlockScopedDeclaration('FunctionExpressionName');
DeclarationType.CLASS_DECLARATION = new BlockScopedDeclaration('ClassDeclaration');
DeclarationType.CLASS_NAME = new BlockScopedDeclaration('ClassName');
DeclarationType.PARAMETER = new FunctionScopedDeclaration('Parameter');
DeclarationType.CATCH_PARAMETER = new BlockScopedDeclaration('CatchParam');
DeclarationType.IMPORT = new BlockScopedDeclaration('Import');

DeclarationType.fromVarDeclKind = function (variableDeclarationKind) {
  switch (variableDeclarationKind) {
    case 'var':
      return DeclarationType.VAR;
    case 'const':
      return DeclarationType.CONST;
    case 'let':
      return DeclarationType.LET;
    default:
      throw new Error('Invalid VariableDeclarationKind: ' + JSON.stringify(variableDeclarationKind));
  }
};

class Declaration {
  constructor(node, type) {
    this.node = node;
    this.type = type;
  }
}

module.exports = {
  DeclarationType,
  BlockScopedDeclaration,
  FunctionScopedDeclaration,
  Declaration,
};
