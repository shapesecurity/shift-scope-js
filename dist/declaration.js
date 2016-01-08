"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var DeclarationType = exports.DeclarationType = function DeclarationType(name, isBlockScoped) {
  _classCallCheck(this, DeclarationType);

  this.name = name;
  this.isBlockScoped = !!isBlockScoped;
  this.isFunctionScoped = !isBlockScoped;
};

var BlockScopedDeclaration = exports.BlockScopedDeclaration = (function (_DeclarationType) {
  _inherits(BlockScopedDeclaration, _DeclarationType);

  function BlockScopedDeclaration(name) {
    _classCallCheck(this, BlockScopedDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BlockScopedDeclaration).call(this, name, true));
  }

  return BlockScopedDeclaration;
})(DeclarationType);

var FunctionScopedDeclaration = exports.FunctionScopedDeclaration = (function (_DeclarationType2) {
  _inherits(FunctionScopedDeclaration, _DeclarationType2);

  function FunctionScopedDeclaration(name) {
    _classCallCheck(this, FunctionScopedDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionScopedDeclaration).call(this, name, false));
  }

  return FunctionScopedDeclaration;
})(DeclarationType);

DeclarationType.VAR = new FunctionScopedDeclaration("Var");
DeclarationType.CONST = new BlockScopedDeclaration("Const");
DeclarationType.LET = new BlockScopedDeclaration("Let");
DeclarationType.FUNCTION_DECLARATION = new BlockScopedDeclaration("FunctionDeclaration"); // potentially also `FunctionScoped` versions of this, for functions at top of functions/etc?
DeclarationType.FUNCTION_VAR_DECLARATION = new FunctionScopedDeclaration("FunctionB33"); // The additional variable created by B.3.3.
DeclarationType.FUNCTION_NAME = new BlockScopedDeclaration("FunctionExpressionName");
DeclarationType.CLASS_DECLARATION = new BlockScopedDeclaration("ClassDeclaration");
DeclarationType.CLASS_NAME = new BlockScopedDeclaration("ClassExpressionName");
DeclarationType.PARAMETER = new FunctionScopedDeclaration("Parameter");
DeclarationType.CATCH_PARAMETER = new BlockScopedDeclaration("CatchParam");
DeclarationType.IMPORT = new BlockScopedDeclaration("Import");

DeclarationType.fromVarDeclKind = function (variableDeclarationKind) {
  switch (variableDeclarationKind) {
    case "var":
      return DeclarationType.VAR;
    case "const":
      return DeclarationType.CONST;
    case "let":
      return DeclarationType.LET;
    default:
      throw new Error("Invalid VariableDeclarationKind: " + JSON.stringify(variableDeclarationKind));
  }
};

var Declaration = exports.Declaration = function Declaration(node, type) {
  _classCallCheck(this, Declaration);

  this.node = node;
  this.type = type;
};