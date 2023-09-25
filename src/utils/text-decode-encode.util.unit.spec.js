import { test } from '../../test-utils/unit/test.util.js'
import { textToSjisBytes, sjisBytesToText } from './text-decode-encode.util.js'

test('given a single unicode char, textToSjisBytes should correctly match the correct codepoint in SJIS, from UTF8 code point, and revert it', ({ expect }) => {
  expect({
    bytesFromText: Array.from(textToSjisBytes('\u53cb')),
    decodeEncoded: sjisBytesToText(textToSjisBytes('\u53cb')),
  }).toEqual({
    bytesFromText: [151, 70],
    decodeEncoded: '\u53cb',
  })
})
