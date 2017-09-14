/**
 * Copyright 2017 Shape Security, Inc.
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

export function stripComments(src) {
  // This doesn't handle html comments, because don't put html comments in your test code.
  // This also doesn't handle mismatched braces inside of regex literals. Doing so requires actual parsing (to disambiguate between "division" and "start of regex literal").
  let out = '';
  let lastTextBegun = 0;
  let braceDepthsForEachTemplateInterpolationNesting = [0];
  for (let i = 0; i < src.length; ++i) {
    let c = src[i];
    switch (c) {
      case '\\': {
        // necessary for e.g. x = /\//i
        ++i;
        break;
      }
      case '"':
      case '\'': {
        for (++i; i < src.length; ++i) {
          let c1 = src[i];
          if (c1 === '\\') ++i;
          else if (c1 === c) break;
        }
        break;
      }
      case '{': {
        ++braceDepthsForEachTemplateInterpolationNesting[0];
        break;
      }
      case '}': {
        if (braceDepthsForEachTemplateInterpolationNesting[0] > 0) {
          --braceDepthsForEachTemplateInterpolationNesting[0];
          break;
        } else {
          braceDepthsForEachTemplateInterpolationNesting.shift();
          // fall through
        }
      }
      case '`': {
        for (++i; i < src.length; ++i) {
          if (src[i] === '\\') {
            ++i;
          } else if (src[i] === '`') {
            break;
          } else if (src[i] === '$' && src[i + 1] === '{') {
            braceDepthsForEachTemplateInterpolationNesting.unshift(0);
            ++i;
            break;
          }
        }
        break;
      }
      case '/': {
        let c1 = src[i + 1];
        if (c1 === '/') {
          out += src.substring(lastTextBegun, i);
          for (++i; i < src.length; ++i) {
            if (src[i] === '\r') {
              if (src[i + 1] === '\n') {
                ++i;
              }
              break;
            } else if (src[i] === '\n') {
              break;
            }
          }
          lastTextBegun = i;
        } else if (c1 === '*') {
          out += src.substring(lastTextBegun, i);
          for (++i; i < src.length; ++i) {
            if (src[i] === '*' && src[i + 1] === '/') {
              ++i;
              break;
            }
          }
          lastTextBegun = i + 1;
        }
        break;
      }
    }
  }
  if (lastTextBegun < src.length) out += src.substring(lastTextBegun);
  return out;
}
