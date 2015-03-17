"use strict";

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

var Accessibility = exports.Accessibility = function Accessibility(isRead, isWrite) {
  _classCallCheck(this, Accessibility);

  this.isRead = !!isRead;
  this.isWrite = !!isWrite;
  this.isReadWrite = !!(isRead && isWrite);
};

Accessibility.READ = new Accessibility(true, false);
Accessibility.WRITE = new Accessibility(false, true);
Accessibility.READWRITE = new Accessibility(true, true);

var Reference = function Reference(node, accessibility) {
  _classCallCheck(this, Reference);

  this.node = node;
  this.accessibility = accessibility;
};

var ReadReference = exports.ReadReference = (function (_Reference) {
  function ReadReference(node) {
    _classCallCheck(this, ReadReference);

    _get(Object.getPrototypeOf(ReadReference.prototype), "constructor", this).call(this, node, Accessibility.READ);
  }

  _inherits(ReadReference, _Reference);

  return ReadReference;
})(Reference);

var WriteReference = exports.WriteReference = (function (_Reference2) {
  function WriteReference(node) {
    _classCallCheck(this, WriteReference);

    _get(Object.getPrototypeOf(WriteReference.prototype), "constructor", this).call(this, node, Accessibility.WRITE);
  }

  _inherits(WriteReference, _Reference2);

  return WriteReference;
})(Reference);

var ReadWriteReference = exports.ReadWriteReference = (function (_Reference3) {
  function ReadWriteReference(node) {
    _classCallCheck(this, ReadWriteReference);

    _get(Object.getPrototypeOf(ReadWriteReference.prototype), "constructor", this).call(this, node, Accessibility.READWRITE);
  }

  _inherits(ReadWriteReference, _Reference3);

  return ReadWriteReference;
})(Reference);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWZlcmVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JhLGFBQWEsV0FBYixhQUFhLEdBQ2IsU0FEQSxhQUFhLENBQ1osTUFBTSxFQUFFLE9BQU8sRUFBRTt3QkFEbEIsYUFBYTs7QUFFdEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUN6QixNQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxNQUFNLElBQUksT0FBTyxDQUFBLEFBQUMsQ0FBQztDQUMxQzs7QUFHSCxhQUFhLENBQUMsSUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwRCxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRCxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7SUFFbEQsU0FBUyxHQUNGLFNBRFAsU0FBUyxDQUNELElBQUksRUFBRSxhQUFhLEVBQUU7d0JBRDdCLFNBQVM7O0FBRVgsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7Q0FDcEM7O0lBR1UsYUFBYSxXQUFiLGFBQWE7QUFDYixXQURBLGFBQWEsQ0FDWixJQUFJLEVBQUU7MEJBRFAsYUFBYTs7QUFFdEIsK0JBRlMsYUFBYSw2Q0FFaEIsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUU7R0FDakM7O1lBSFUsYUFBYTs7U0FBYixhQUFhO0dBQVMsU0FBUzs7SUFNL0IsY0FBYyxXQUFkLGNBQWM7QUFDZCxXQURBLGNBQWMsQ0FDYixJQUFJLEVBQUU7MEJBRFAsY0FBYzs7QUFFdkIsK0JBRlMsY0FBYyw2Q0FFakIsSUFBSSxFQUFFLGFBQWEsQ0FBQyxLQUFLLEVBQUU7R0FDbEM7O1lBSFUsY0FBYzs7U0FBZCxjQUFjO0dBQVMsU0FBUzs7SUFNaEMsa0JBQWtCLFdBQWxCLGtCQUFrQjtBQUNsQixXQURBLGtCQUFrQixDQUNqQixJQUFJLEVBQUU7MEJBRFAsa0JBQWtCOztBQUUzQiwrQkFGUyxrQkFBa0IsNkNBRXJCLElBQUksRUFBRSxhQUFhLENBQUMsU0FBUyxFQUFFO0dBQ3RDOztZQUhVLGtCQUFrQjs7U0FBbEIsa0JBQWtCO0dBQVMsU0FBUyIsImZpbGUiOiJzcmMvcmVmZXJlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCBTaGFwZSBTZWN1cml0eSwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmV4cG9ydCBjbGFzcyBBY2Nlc3NpYmlsaXR5IHtcbiAgY29uc3RydWN0b3IoaXNSZWFkLCBpc1dyaXRlKSB7XG4gICAgdGhpcy5pc1JlYWQgPSAhIWlzUmVhZDtcbiAgICB0aGlzLmlzV3JpdGUgPSAhIWlzV3JpdGU7XG4gICAgdGhpcy5pc1JlYWRXcml0ZSA9ICEhKGlzUmVhZCAmJiBpc1dyaXRlKTtcbiAgfVxufVxuXG5BY2Nlc3NpYmlsaXR5LlJFQUQgPSBuZXcgQWNjZXNzaWJpbGl0eSh0cnVlLCBmYWxzZSk7XG5BY2Nlc3NpYmlsaXR5LldSSVRFID0gbmV3IEFjY2Vzc2liaWxpdHkoZmFsc2UsIHRydWUpO1xuQWNjZXNzaWJpbGl0eS5SRUFEV1JJVEUgPSBuZXcgQWNjZXNzaWJpbGl0eSh0cnVlLCB0cnVlKTtcblxuY2xhc3MgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3Iobm9kZSwgYWNjZXNzaWJpbGl0eSkge1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgdGhpcy5hY2Nlc3NpYmlsaXR5ID0gYWNjZXNzaWJpbGl0eTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZFJlZmVyZW5jZSBleHRlbmRzIFJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBzdXBlcihub2RlLCBBY2Nlc3NpYmlsaXR5LlJFQUQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXcml0ZVJlZmVyZW5jZSBleHRlbmRzIFJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBzdXBlcihub2RlLCBBY2Nlc3NpYmlsaXR5LldSSVRFKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZFdyaXRlUmVmZXJlbmNlIGV4dGVuZHMgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHN1cGVyKG5vZGUsIEFjY2Vzc2liaWxpdHkuUkVBRFdSSVRFKTtcbiAgfVxufVxuIl19