import assert from 'node:assert';
import { test } from 'node:test';
import { textToSjisBytes, sjisBytesToText } from "./text-decode-encode.util.js";


test('given a single unicode char, textToSjisBytes should correctly match the correct codepoint in SJIS, from UTF8 code point, and revert it', () => {
    assert.deepEqual(Array.from(textToSjisBytes('\u53cb')), [ 151, 70 ])
    assert.deepEqual(sjisBytesToText(textToSjisBytes('\u53cb')), '\u53cb')
}); 



