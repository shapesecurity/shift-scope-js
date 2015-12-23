"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

DeclarationType.VAR = new FunctionScopedDeclaration("var");
DeclarationType.CONST = new BlockScopedDeclaration("const");
DeclarationType.LET = new BlockScopedDeclaration("let");
DeclarationType.FUNCTION_DECLARATION = new BlockScopedDeclaration("function declaration"); // potentially also FunctionScoped
DeclarationType.FUNCTION_NAME = new BlockScopedDeclaration("function name");
DeclarationType.CLASS_NAME = new BlockScopedDeclaration("class name");
DeclarationType.PARAMETER = new FunctionScopedDeclaration("parameter");
DeclarationType.CATCH_PARAMETER = new BlockScopedDeclaration("catch parameter");

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
// TODO probably don't need these

var VarDeclaration = exports.VarDeclaration = (function (_Declaration) {
  _inherits(VarDeclaration, _Declaration);

  function VarDeclaration(node) {
    _classCallCheck(this, VarDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(VarDeclaration).call(this, node, DeclarationType.VAR));
  }

  return VarDeclaration;
})(Declaration);

var ConstDeclaration = exports.ConstDeclaration = (function (_Declaration2) {
  _inherits(ConstDeclaration, _Declaration2);

  function ConstDeclaration(node) {
    _classCallCheck(this, ConstDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ConstDeclaration).call(this, node, DeclarationType.CONST));
  }

  return ConstDeclaration;
})(Declaration);

var LetDeclaration = exports.LetDeclaration = (function (_Declaration3) {
  _inherits(LetDeclaration, _Declaration3);

  function LetDeclaration(node) {
    _classCallCheck(this, LetDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(LetDeclaration).call(this, node, DeclarationType.LET));
  }

  return LetDeclaration;
})(Declaration);

var FunctionNameDeclaration = exports.FunctionNameDeclaration = (function (_Declaration4) {
  _inherits(FunctionNameDeclaration, _Declaration4);

  function FunctionNameDeclaration(node) {
    _classCallCheck(this, FunctionNameDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionNameDeclaration).call(this, node, DeclarationType.FUNCTION_NAME));
  }

  return FunctionNameDeclaration;
})(Declaration);

var ParameterDeclaration = exports.ParameterDeclaration = (function (_Declaration5) {
  _inherits(ParameterDeclaration, _Declaration5);

  function ParameterDeclaration(node) {
    _classCallCheck(this, ParameterDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ParameterDeclaration).call(this, node, DeclarationType.PARAMETER));
  }

  return ParameterDeclaration;
})(Declaration);

var CatchDeclaration = exports.CatchDeclaration = (function (_Declaration6) {
  _inherits(CatchDeclaration, _Declaration6);

  function CatchDeclaration(node) {
    _classCallCheck(this, CatchDeclaration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(CatchDeclaration).call(this, node, DeclarationType.CATCH));
  }

  return CatchDeclaration;
})(Declaration);