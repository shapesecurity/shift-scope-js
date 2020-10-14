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

const ScopeAnalyzer = require('./scope-analyzer');
const ScopeLookup = require('./scope-lookup');
const annotate = require('./annotate-source');
const { ScopeType } = require('./scope');
const { DeclarationType } = require('./declaration');
const { Accessibility } = require('./reference');
const { serialize } = require('./scope-serializer');

function analyze(script) {
  return ScopeAnalyzer.analyze(script);
}

module.exports = {
  default: analyze,
  analyze,
  ScopeLookup,
  annotate,
  ScopeType,
  DeclarationType,
  Accessibility,
  serialize,
};
