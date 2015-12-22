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

var Accessibility = exports.Accessibility = function Accessibility(isRead, isWrite) {
  _classCallCheck(this, Accessibility);

  this.isRead = !!isRead;
  this.isWrite = !!isWrite;
  this.isReadWrite = !!(isRead && isWrite);
};

Accessibility.READ = new Accessibility(true, false);
Accessibility.WRITE = new Accessibility(false, true);
Accessibility.READWRITE = new Accessibility(true, true);

var Reference = exports.Reference = function Reference(node, accessibility) {
  _classCallCheck(this, Reference);

  this.node = node;
  this.accessibility = accessibility;
};

var ReadReference = exports.ReadReference = (function (_Reference) {
  _inherits(ReadReference, _Reference);

  function ReadReference(node) {
    _classCallCheck(this, ReadReference);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ReadReference).call(this, node, Accessibility.READ));
  }

  return ReadReference;
})(Reference);

// TODO these are unneccesary probably

var WriteReference = exports.WriteReference = (function (_Reference2) {
  _inherits(WriteReference, _Reference2);

  function WriteReference(node) {
    _classCallCheck(this, WriteReference);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(WriteReference).call(this, node, Accessibility.WRITE));
  }

  return WriteReference;
})(Reference);

var ReadWriteReference = exports.ReadWriteReference = (function (_Reference3) {
  _inherits(ReadWriteReference, _Reference3);

  function ReadWriteReference(node) {
    _classCallCheck(this, ReadWriteReference);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ReadWriteReference).call(this, node, Accessibility.READWRITE));
  }

  return ReadWriteReference;
})(Reference);