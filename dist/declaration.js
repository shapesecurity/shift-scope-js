"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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
  function BlockScopedDeclaration(name) {
    _classCallCheck(this, BlockScopedDeclaration);

    _get(Object.getPrototypeOf(BlockScopedDeclaration.prototype), "constructor", this).call(this, name, true);
  }

  _inherits(BlockScopedDeclaration, _DeclarationType);

  return BlockScopedDeclaration;
})(DeclarationType);

var FunctionScopedDeclaration = exports.FunctionScopedDeclaration = (function (_DeclarationType2) {
  function FunctionScopedDeclaration(name) {
    _classCallCheck(this, FunctionScopedDeclaration);

    _get(Object.getPrototypeOf(FunctionScopedDeclaration.prototype), "constructor", this).call(this, name, false);
  }

  _inherits(FunctionScopedDeclaration, _DeclarationType2);

  return FunctionScopedDeclaration;
})(DeclarationType);

DeclarationType.VAR = new FunctionScopedDeclaration("var");
DeclarationType.CONST = new BlockScopedDeclaration("const");
DeclarationType.LET = new BlockScopedDeclaration("let");
DeclarationType.FUNCTION_NAME = new FunctionScopedDeclaration("function name");
DeclarationType.PARAMETER = new FunctionScopedDeclaration("parameter");
DeclarationType.CATCH = new BlockScopedDeclaration("catch");
// TODO other types

var Declaration = exports.Declaration = (function () {
  function Declaration(node, type) {
    _classCallCheck(this, Declaration);

    this.node = node;
    this.type = type;
    // for backwards compatibility with 1.x:
    this.kind = type;
  }

  _createClass(Declaration, null, {
    fromVarDeclKind: {
      value: function fromVarDeclKind(node, variableDeclarationKind) {
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
  });

  return Declaration;
})();

// TODO probably don't need these

var VarDeclaration = exports.VarDeclaration = (function (_Declaration) {
  function VarDeclaration(node) {
    _classCallCheck(this, VarDeclaration);

    _get(Object.getPrototypeOf(VarDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.VAR);
  }

  _inherits(VarDeclaration, _Declaration);

  return VarDeclaration;
})(Declaration);

var ConstDeclaration = exports.ConstDeclaration = (function (_Declaration2) {
  function ConstDeclaration(node) {
    _classCallCheck(this, ConstDeclaration);

    _get(Object.getPrototypeOf(ConstDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.CONST);
  }

  _inherits(ConstDeclaration, _Declaration2);

  return ConstDeclaration;
})(Declaration);

var LetDeclaration = exports.LetDeclaration = (function (_Declaration3) {
  function LetDeclaration(node) {
    _classCallCheck(this, LetDeclaration);

    _get(Object.getPrototypeOf(LetDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.LET);
  }

  _inherits(LetDeclaration, _Declaration3);

  return LetDeclaration;
})(Declaration);

var FunctionNameDeclaration = exports.FunctionNameDeclaration = (function (_Declaration4) {
  function FunctionNameDeclaration(node) {
    _classCallCheck(this, FunctionNameDeclaration);

    _get(Object.getPrototypeOf(FunctionNameDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.FUNCTION_NAME);
  }

  _inherits(FunctionNameDeclaration, _Declaration4);

  return FunctionNameDeclaration;
})(Declaration);

var ParameterDeclaration = exports.ParameterDeclaration = (function (_Declaration5) {
  function ParameterDeclaration(node) {
    _classCallCheck(this, ParameterDeclaration);

    _get(Object.getPrototypeOf(ParameterDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.PARAMETER);
  }

  _inherits(ParameterDeclaration, _Declaration5);

  return ParameterDeclaration;
})(Declaration);

var CatchDeclaration = exports.CatchDeclaration = (function (_Declaration6) {
  function CatchDeclaration(node) {
    _classCallCheck(this, CatchDeclaration);

    _get(Object.getPrototypeOf(CatchDeclaration.prototype), "constructor", this).call(this, node, DeclarationType.CATCH);
  }

  _inherits(CatchDeclaration, _Declaration6);

  return CatchDeclaration;
})(Declaration);
//# sourceMappingURL=data:application/json;base64,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Q0FFbkIsSUFBSSxFQUFFLGVBQWUsQ0FBQyxLQUFLLEVBQUU7R0FDcEM7O1lBSFUsZ0JBQWdCOztTQUFoQixnQkFBZ0I7R0FBUyxXQUFXOztJQU1wQyxjQUFjLFdBQWQsY0FBYztBQUNkLFdBREEsY0FBYyxDQUNiLElBQUksRUFBRTswQkFEUCxjQUFjOztBQUV2QiwrQkFGUyxjQUFjLDZDQUVqQixJQUFJLEVBQUUsZUFBZSxDQUFDLEdBQUcsRUFBRTtHQUNsQzs7WUFIVSxjQUFjOztTQUFkLGNBQWM7R0FBUyxXQUFXOztJQU1sQyx1QkFBdUIsV0FBdkIsdUJBQXVCO0FBQ3ZCLFdBREEsdUJBQXVCLENBQ3RCLElBQUksRUFBRTswQkFEUCx1QkFBdUI7O0FBRWhDLCtCQUZTLHVCQUF1Qiw2Q0FFMUIsSUFBSSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUU7R0FDNUM7O1lBSFUsdUJBQXVCOztTQUF2Qix1QkFBdUI7R0FBUyxXQUFXOztJQU0zQyxvQkFBb0IsV0FBcEIsb0JBQW9CO0FBQ3BCLFdBREEsb0JBQW9CLENBQ25CLElBQUksRUFBRTswQkFEUCxvQkFBb0I7O0FBRTdCLCtCQUZTLG9CQUFvQiw2Q0FFdkIsSUFBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLEVBQUU7R0FDeEM7O1lBSFUsb0JBQW9COztTQUFwQixvQkFBb0I7R0FBUyxXQUFXOztJQU14QyxnQkFBZ0IsV0FBaEIsZ0JBQWdCO0FBQ2hCLFdBREEsZ0JBQWdCLENBQ2YsSUFBSSxFQUFFOzBCQURQLGdCQUFnQjs7QUFFekIsK0JBRlMsZ0JBQWdCLDZDQUVuQixJQUFJLEVBQUUsZUFBZSxDQUFDLEtBQUssRUFBRTtHQUNwQzs7WUFIVSxnQkFBZ0I7O1NBQWhCLGdCQUFnQjtHQUFTLFdBQVciLCJmaWxlIjoic3JjL2RlY2xhcmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBTaGFwZSBTZWN1cml0eSwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmV4cG9ydCBjbGFzcyBEZWNsYXJhdGlvblR5cGUge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBpc0Jsb2NrU2NvcGVkKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmlzQmxvY2tTY29wZWQgPSAhIWlzQmxvY2tTY29wZWQ7XG4gICAgdGhpcy5pc0Z1bmN0aW9uU2NvcGVkID0gIWlzQmxvY2tTY29wZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJsb2NrU2NvcGVkRGVjbGFyYXRpb24gZXh0ZW5kcyBEZWNsYXJhdGlvblR5cGUge1xuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSwgdHJ1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uU2NvcGVkRGVjbGFyYXRpb24gZXh0ZW5kcyBEZWNsYXJhdGlvblR5cGUge1xuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSwgZmFsc2UpO1xuICB9XG59XG5cbkRlY2xhcmF0aW9uVHlwZS5WQVIgPSBuZXcgRnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbihcInZhclwiKTtcbkRlY2xhcmF0aW9uVHlwZS5DT05TVCA9IG5ldyBCbG9ja1Njb3BlZERlY2xhcmF0aW9uKFwiY29uc3RcIik7XG5EZWNsYXJhdGlvblR5cGUuTEVUID0gbmV3IEJsb2NrU2NvcGVkRGVjbGFyYXRpb24oXCJsZXRcIik7XG5EZWNsYXJhdGlvblR5cGUuRlVOQ1RJT05fTkFNRSA9IG5ldyBGdW5jdGlvblNjb3BlZERlY2xhcmF0aW9uKFwiZnVuY3Rpb24gbmFtZVwiKTtcbkRlY2xhcmF0aW9uVHlwZS5QQVJBTUVURVIgPSBuZXcgRnVuY3Rpb25TY29wZWREZWNsYXJhdGlvbihcInBhcmFtZXRlclwiKTtcbkRlY2xhcmF0aW9uVHlwZS5DQVRDSCA9IG5ldyBCbG9ja1Njb3BlZERlY2xhcmF0aW9uKFwiY2F0Y2hcIik7XG4vLyBUT0RPIG90aGVyIHR5cGVzXG5cbmV4cG9ydCBjbGFzcyBEZWNsYXJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5vZGUsIHR5cGUpIHtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggMS54OlxuICAgIHRoaXMua2luZCA9IHR5cGU7XG4gIH1cblxuICBzdGF0aWMgZnJvbVZhckRlY2xLaW5kKG5vZGUsIHZhcmlhYmxlRGVjbGFyYXRpb25LaW5kKSB7XG4gICAgc3dpdGNoICh2YXJpYWJsZURlY2xhcmF0aW9uS2luZCkge1xuICAgIGNhc2UgXCJ2YXJcIjpcbiAgICAgIHJldHVybiBuZXcgVmFyRGVjbGFyYXRpb24obm9kZSk7XG4gICAgY2FzZSBcImNvbnN0XCI6XG4gICAgICByZXR1cm4gbmV3IENvbnN0RGVjbGFyYXRpb24obm9kZSk7XG4gICAgY2FzZSBcImxldFwiOlxuICAgICAgcmV0dXJuIG5ldyBMZXREZWNsYXJhdGlvbihub2RlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBWYXJpYWJsZURlY2xhcmF0aW9uS2luZDogXCIgKyBKU09OLnN0cmluZ2lmeSh2YXJpYWJsZURlY2xhcmF0aW9uS2luZCkpO1xuICAgIH1cbiAgfVxufVxuLy8gVE9ETyBwcm9iYWJseSBkb24ndCBuZWVkIHRoZXNlXG5leHBvcnQgY2xhc3MgVmFyRGVjbGFyYXRpb24gZXh0ZW5kcyBEZWNsYXJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBzdXBlcihub2RlLCBEZWNsYXJhdGlvblR5cGUuVkFSKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29uc3REZWNsYXJhdGlvbiBleHRlbmRzIERlY2xhcmF0aW9uIHtcbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHN1cGVyKG5vZGUsIERlY2xhcmF0aW9uVHlwZS5DT05TVCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExldERlY2xhcmF0aW9uIGV4dGVuZHMgRGVjbGFyYXRpb24ge1xuICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgc3VwZXIobm9kZSwgRGVjbGFyYXRpb25UeXBlLkxFVCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uTmFtZURlY2xhcmF0aW9uIGV4dGVuZHMgRGVjbGFyYXRpb24ge1xuICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgc3VwZXIobm9kZSwgRGVjbGFyYXRpb25UeXBlLkZVTkNUSU9OX05BTUUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJhbWV0ZXJEZWNsYXJhdGlvbiBleHRlbmRzIERlY2xhcmF0aW9uIHtcbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHN1cGVyKG5vZGUsIERlY2xhcmF0aW9uVHlwZS5QQVJBTUVURVIpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXRjaERlY2xhcmF0aW9uIGV4dGVuZHMgRGVjbGFyYXRpb24ge1xuICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgc3VwZXIobm9kZSwgRGVjbGFyYXRpb25UeXBlLkNBVENIKTtcbiAgfVxufVxuIl19