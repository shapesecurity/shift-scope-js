"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _es6Set = require("es6-set");

var _es6Set2 = _interopRequireDefault(_es6Set);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var reduce = _shiftReducer2.default.default; // (babel) TODO remove this

// TODO this file should live elsewhere

// Given a Script, the analyze method returns a set containing all ArrowExpression, FunctionDeclaration, FunctionExpression, and Script nodes which are sloppy mode. All other ArrowExpression, FunctionDeclaration, FunctionExpression, and Script nodes are strict.

var StrictnessReducer = (function (_MonoidalReducer) {
  _inherits(StrictnessReducer, _MonoidalReducer);

  function StrictnessReducer() {
    _classCallCheck(this, StrictnessReducer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StrictnessReducer).call(this, SetMonoid));
  }

  _createClass(StrictnessReducer, [{
    key: "reduceArrowExpression",
    value: function reduceArrowExpression(node, _ref) {
      var params = _ref.params;
      var body = _ref.body;

      if (node.body.type === "FunctionBody" && hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceArrowExpression", this).call(this, node, { params: params, body: body }).add(node);
    }
  }, {
    key: "reduceClassDeclaration",
    value: function reduceClassDeclaration(node, _ref2) {
      var name = _ref2.name;
      var _super = _ref2.super;
      var elements = _ref2.elements;

      return SetMonoid.empty();
    }
  }, {
    key: "reduceClassExpression",
    value: function reduceClassExpression(node, _ref3) {
      var name = _ref3.name;
      var _super = _ref3.super;
      var elements = _ref3.elements;

      return SetMonoid.empty();
    }
  }, {
    key: "reduceFunctionDeclaration",
    value: function reduceFunctionDeclaration(node, _ref4) {
      var name = _ref4.name;
      var params = _ref4.params;
      var body = _ref4.body;

      if (hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceFunctionDeclaration", this).call(this, node, { name: name, params: params, body: body }).add(node);
    }
  }, {
    key: "reduceFunctionExpression",
    value: function reduceFunctionExpression(node, _ref5) {
      var name = _ref5.name;
      var params = _ref5.params;
      var body = _ref5.body;

      if (hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceFunctionExpression", this).call(this, node, { name: name, params: params, body: body }).add(node);
    }
  }, {
    key: "reduceGetter",
    value: function reduceGetter(node, _ref6) {
      var name = _ref6.name;
      var body = _ref6.body;

      if (hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceGetter", this).call(this, node, { name: name, body: body }).add(node);
    }
  }, {
    key: "reduceMethod",
    value: function reduceMethod(node, _ref7) {
      var name = _ref7.name;
      var params = _ref7.params;
      var body = _ref7.body;

      if (hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceMethod", this).call(this, node, { name: name, params: params, body: body }).add(node);
    }
  }, {
    key: "reduceScript",
    value: function reduceScript(node, _ref8) {
      var directives = _ref8.directives;
      var statements = _ref8.statements;

      if (hasStrict(node.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceScript", this).call(this, node, { directives: directives, statements: statements }).add(node);
    }
  }, {
    key: "reduceSetter",
    value: function reduceSetter(node, _ref9) {
      var name = _ref9.name;
      var param = _ref9.param;
      var body = _ref9.body;

      if (hasStrict(node.body.directives)) {
        return SetMonoid.empty();
      }
      return _get(Object.getPrototypeOf(StrictnessReducer.prototype), "reduceSetter", this).call(this, node, { name: name, param: param, body: body }).add(node);
    }
  }], [{
    key: "analyze",
    value: function analyze(script) {
      return reduce(new this(), script).extract();
    }
  }]);

  return StrictnessReducer;
})(_shiftReducer.MonoidalReducer);

exports.default = StrictnessReducer;

function hasStrict(directives) {
  return directives.some(function (d) {
    return d.rawValue === "use strict";
  });
}

function merge(s1, s2) {
  var out = new _es6Set2.default();
  s1.forEach(function (v) {
    return out.add(v);
  });
  s2.forEach(function (v) {
    return out.add(v);
  });
  return out;
}

var SetMonoid = (function () {
  // nb not immutable

  function SetMonoid(set) {
    _classCallCheck(this, SetMonoid);

    this.set = set;
  }

  _createClass(SetMonoid, [{
    key: "concat",
    value: function concat(b) {
      return new SetMonoid(merge(this.set, b.set));
    }
  }, {
    key: "extract",
    value: function extract() {
      return this.set;
    }
  }, {
    key: "add",
    value: function add(e) {
      // this happens to work, since, as used in StrictnessReducer, .add is never called until after something has been merged, so the identity element is never mutated.
      // to do this in an immutable fashion, uncomment the line below.
      // this.set = merge(new Set, this.set);
      this.set.add(e);
      return this;
    }
  }], [{
    key: "empty",
    value: function empty() {
      return new SetMonoid(new _es6Set2.default());
    }
  }]);

  return SetMonoid;
})();