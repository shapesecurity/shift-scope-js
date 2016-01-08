"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _shiftSpec = require("shift-spec");

var _shiftSpec2 = _interopRequireDefault(_shiftSpec);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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

var reduce = _shiftReducer2.default.default; // (babel) TODO remove this

// TODO this file should live elsewhere

// Gives a flat list of all nodes rooted at the given node, in preorder: that is, a node appears before its children.

var Flattener = (function (_MonoidalReducer) {
  _inherits(Flattener, _MonoidalReducer);

  // We explicitly invoke Monoidal.prototype methods so that we can automatically generate methods from the spec.

  function Flattener() {
    _classCallCheck(this, Flattener);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Flattener).call(this, ListMonoid));
  }

  _createClass(Flattener, null, [{
    key: "flatten",
    value: function flatten(node) {
      return reduce(new this(), node).extract();
    }
  }]);

  return Flattener;
})(_shiftReducer.MonoidalReducer);

exports.default = Flattener;

var _loop = function _loop(typeName) {
  var type = _shiftSpec2.default[typeName];
  Object.defineProperty(Flattener.prototype, "reduce" + typeName, {
    value: function value(node, state) {
      return new ListMonoid([node]).concat(_shiftReducer.MonoidalReducer.prototype["reduce" + typeName].call(this, node, state));
    }
  });
};

for (var typeName in _shiftSpec2.default) {
  _loop(typeName);
}

var ListMonoid = (function () {
  function ListMonoid(list) {
    _classCallCheck(this, ListMonoid);

    this.list = list;
  }

  _createClass(ListMonoid, [{
    key: "concat",
    value: function concat(b) {
      return new ListMonoid(this.list.concat(b.list));
    }
  }, {
    key: "extract",
    value: function extract() {
      return this.list;
    }
  }], [{
    key: "empty",
    value: function empty() {
      return new ListMonoid([]);
    }
  }]);

  return ListMonoid;
})();