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

// TODO these are unneccesary probably

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWZlcmVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JhLGFBQWEsV0FBYixhQUFhLEdBQ2IsU0FEQSxhQUFhLENBQ1osTUFBTSxFQUFFLE9BQU8sRUFBRTt3QkFEbEIsYUFBYTs7QUFFdEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUN6QixNQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxNQUFNLElBQUksT0FBTyxDQUFBLEFBQUMsQ0FBQztDQUMxQzs7QUFHSCxhQUFhLENBQUMsSUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwRCxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRCxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7SUFFbEQsU0FBUyxHQUNGLFNBRFAsU0FBUyxDQUNELElBQUksRUFBRSxhQUFhLEVBQUU7d0JBRDdCLFNBQVM7O0FBRVgsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7Q0FDcEM7Ozs7SUFJVSxhQUFhLFdBQWIsYUFBYTtBQUNiLFdBREEsYUFBYSxDQUNaLElBQUksRUFBRTswQkFEUCxhQUFhOztBQUV0QiwrQkFGUyxhQUFhLDZDQUVoQixJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRTtHQUNqQzs7WUFIVSxhQUFhOztTQUFiLGFBQWE7R0FBUyxTQUFTOztJQU0vQixjQUFjLFdBQWQsY0FBYztBQUNkLFdBREEsY0FBYyxDQUNiLElBQUksRUFBRTswQkFEUCxjQUFjOztBQUV2QiwrQkFGUyxjQUFjLDZDQUVqQixJQUFJLEVBQUUsYUFBYSxDQUFDLEtBQUssRUFBRTtHQUNsQzs7WUFIVSxjQUFjOztTQUFkLGNBQWM7R0FBUyxTQUFTOztJQU1oQyxrQkFBa0IsV0FBbEIsa0JBQWtCO0FBQ2xCLFdBREEsa0JBQWtCLENBQ2pCLElBQUksRUFBRTswQkFEUCxrQkFBa0I7O0FBRTNCLCtCQUZTLGtCQUFrQiw2Q0FFckIsSUFBSSxFQUFFLGFBQWEsQ0FBQyxTQUFTLEVBQUU7R0FDdEM7O1lBSFUsa0JBQWtCOztTQUFsQixrQkFBa0I7R0FBUyxTQUFTIiwiZmlsZSI6InNyYy9yZWZlcmVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE0IFNoYXBlIFNlY3VyaXR5LCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZXhwb3J0IGNsYXNzIEFjY2Vzc2liaWxpdHkge1xuICBjb25zdHJ1Y3Rvcihpc1JlYWQsIGlzV3JpdGUpIHtcbiAgICB0aGlzLmlzUmVhZCA9ICEhaXNSZWFkO1xuICAgIHRoaXMuaXNXcml0ZSA9ICEhaXNXcml0ZTtcbiAgICB0aGlzLmlzUmVhZFdyaXRlID0gISEoaXNSZWFkICYmIGlzV3JpdGUpO1xuICB9XG59XG5cbkFjY2Vzc2liaWxpdHkuUkVBRCA9IG5ldyBBY2Nlc3NpYmlsaXR5KHRydWUsIGZhbHNlKTtcbkFjY2Vzc2liaWxpdHkuV1JJVEUgPSBuZXcgQWNjZXNzaWJpbGl0eShmYWxzZSwgdHJ1ZSk7XG5BY2Nlc3NpYmlsaXR5LlJFQURXUklURSA9IG5ldyBBY2Nlc3NpYmlsaXR5KHRydWUsIHRydWUpO1xuXG5jbGFzcyBSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3Rvcihub2RlLCBhY2Nlc3NpYmlsaXR5KSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLmFjY2Vzc2liaWxpdHkgPSBhY2Nlc3NpYmlsaXR5O1xuICB9XG59XG5cbi8vIFRPRE8gdGhlc2UgYXJlIHVubmVjY2VzYXJ5IHByb2JhYmx5XG5leHBvcnQgY2xhc3MgUmVhZFJlZmVyZW5jZSBleHRlbmRzIFJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBzdXBlcihub2RlLCBBY2Nlc3NpYmlsaXR5LlJFQUQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXcml0ZVJlZmVyZW5jZSBleHRlbmRzIFJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBzdXBlcihub2RlLCBBY2Nlc3NpYmlsaXR5LldSSVRFKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZFdyaXRlUmVmZXJlbmNlIGV4dGVuZHMgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHN1cGVyKG5vZGUsIEFjY2Vzc2liaWxpdHkuUkVBRFdSSVRFKTtcbiAgfVxufVxuIl19