"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
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

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.serialize = serialize;

var _es6Map = require("es6-map");

var _es6Map2 = _interopRequireDefault(_es6Map);

var _flattener = require("./flattener");

var _flattener2 = _interopRequireDefault(_flattener);

var _reference = require("./reference");

var _declaration = require("./declaration");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function serialize(scope) {
	return new Serializer(scope).serialize();
}

var Serializer = function () {
	function Serializer(scope) {
		var _this = this;

		_classCallCheck(this, Serializer);

		this.scope = scope;
		var nodes = _flattener2.default.flatten(scope.astNode);
		this.ids = new _es6Map2.default();
		nodes.forEach(function (n) {
			return _this.ids.set(n, _this.ids.size);
		});
		this.declarationCompare = declarationCompare.bind(this, this.ids);
		this.referenceCompare = referenceCompare.bind(this, this.ids);
		this.variableCompare = variableCompare.bind(this, this.ids);
	}

	_createClass(Serializer, [{
		key: "serialize",
		value: function serialize() {
			return this.serializeScope(this.scope);
		}
	}, {
		key: "serializeScope",
		value: function serializeScope(scope) {
			return "{\"node\": \"" + this.serializeNode(scope.astNode) + "\"" + (", \"type\": \"" + scope.type.name + "\"") + (", \"isDynamic\": " + scope.dynamic) + (", \"through\": " + this.serializeReferenceList(this.collectThrough(scope.through))) + (", \"variables\": " + this.serializeVariableList(scope.variableList)) + (", \"children\": [" + scope.children.map(this.serializeScope.bind(this)).join(", ") + "]") + "}";
		}
	}, {
		key: "serializeNode",
		value: function serializeNode(node) {
			if (node.type === "IdentifierExpression") {
				return "IdentifierExpression(" + node.name + ")_" + this.ids.get(node);
			} else if (node.type === "BindingIdentifier") {
				return "BindingIdentifier(" + node.name + ")_" + this.ids.get(node);
			} else {
				return node.type + "_" + this.ids.get(node);
			}
		}
	}, {
		key: "collectThrough",
		value: function collectThrough(through) {
			var references = [];
			through.forEach(function (v, k) {
				return references.push(v);
			});
			return references.sort(this.referenceCompare);
		}
	}, {
		key: "serializeReference",
		value: function serializeReference(reference) {
			return "{\"node\": \"" + this.serializeNode(reference.node) + "\"" + (", \"accessibility\": \"" + (reference.accessibility.isRead ? "Read" : "") + (reference.accessibility.isWrite ? "Write" : "") + "\"") + "}";
		}
	}, {
		key: "serializeReferenceList",
		value: function serializeReferenceList(references) {
			return "[" + references.map(this.serializeReference.bind(this)).join(', ') + "]";
		}
	}, {
		key: "serializeDeclaration",
		value: function serializeDeclaration(declaration) {
			return "{\"node\": \"" + this.serializeNode(declaration.node) + "\"" + (", \"kind\": \"" + declaration.type.name + "\"") + "}";
		}
	}, {
		key: "serializeVariable",
		value: function serializeVariable(variable) {
			return "{\"name\": \"" + variable.name + "\"" + (", \"references\": " + this.serializeReferenceList(variable.references)) + (", \"declarations\": [" + variable.declarations.map(this.serializeDeclaration.bind(this)).join(', ') + "]") + "}";
		}
	}, {
		key: "serializeVariableList",
		value: function serializeVariableList(variables) {
			variables = variables.slice(0).sort(this.variableCompare);
			return "[" + variables.map(this.serializeVariable.bind(this)).join(', ') + "]";
		}
	}]);

	return Serializer;
}();

function declarationCompare(ids, d1, d2) {
	function kindToInd(kind) {
		switch (kind) {
			case _declaration.DeclarationType.VAR:
				return 0;
			case _declaration.DeclarationType.CONST:
				return 1;
			case _declaration.DeclarationType.LET:
				return 2;
			case _declaration.DeclarationType.FUNCTION_DECLARATION:
				return 3;
			case _declaration.DeclarationType.FUNCTION_VAR_DECLARATION:
				return 4;
			case _declaration.DeclarationType.FUNCTION_NAME:
				return 5;
			case _declaration.DeclarationType.CLASS_NAME:
				return 6;
			case _declaration.DeclarationType.PARAMETER:
				return 7;
			case _declaration.DeclarationType.CATCH_PARAMETER:
				return 8;
			case _declaration.DeclarationType.IMPORT:
				return 9;
			default:
				throw "Unrecognized declaration type";
		}
	}
	var comparison = kindToInd(d1.type) - kindToInd(d2.type);
	if (comparison != 0) {
		return comparison;
	}
	return ids.get(d1.node) - ids.get(d2.node);
}

function referenceCompare(ids, r1, r2) {
	var comparison = (r1.accessibility.isRead ? 1 : 0) + (r1.accessibility.isWrite ? 2 : 0) - ((r2.accessibility.isRead ? 1 : 0) + (r2.accessibility.isWrite ? 2 : 0));
	if (comparison != 0) {
		return comparison;
	}
	return ids.get(r1.node) - ids.get(r2.node);
}

function variableCompare(ids, v1, v2) {
	if (v1.name < v2.name) {
		return -1;
	}
	if (v1.name > v2.name) {
		return 1;
	}
	var comparison = v1.declarations.length - v2.declarations.length;
	if (comparison != 0) {
		return comparison;
	}
	comparison = v1.references.length - v2.references.length;
	if (comparison != 0) {
		return comparison;
	}
	for (var i = 0; i < v1.declarations.length; ++i) {
		var d1 = v1.declarations[i];
		var d2 = v2.declarations[i];
		comparison = declarationCompare(ids, v1, v2);
		if (comparison != 0) {
			return comparison;
		}
	}
}