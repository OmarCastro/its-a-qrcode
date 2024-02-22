import { test } from '../../test-utils/unit/test.util.js'
import { getBestMode, getCharCountBitLength } from './mode-utils.util.js'
import { MODE_NUMBER, MODE_ALPHA_NUM, MODE_KANJI, MODE_8BIT_BYTE } from './mode-bits.constants.js'

test('getBestMode - numbers only will set best mode to numeric', ({ expect }) => {
  expect(getBestMode("1234567890").mode).toEqual(MODE_NUMBER)
})

test('getBestMode - numbers with spaces will set best mode to alphanumeric', ({ expect }) => {
  expect(getBestMode("123 456 789 0").mode).toEqual(MODE_ALPHA_NUM)
})

test('getBestMode - numbers with upper case letters will set best mode to alphanumeric', ({ expect }) => {
  expect(getBestMode("US1234567890EU").mode).toEqual(MODE_ALPHA_NUM)
})

test('getBestMode - kanji characters will set best mode to kanji', ({ expect }) => {
  expect(getBestMode("こんにちは世界").mode).toEqual(MODE_KANJI)
})

test('getBestMode - other chars will set best mode to byte', ({ expect }) => {
  expect(getBestMode("Lorem ipsum dolor sit amet").mode).toEqual(MODE_8BIT_BYTE)
})

test('getCharCountBitLength - invalid version will throw error', ({ expect }) => {
  expect(() => getCharCountBitLength(MODE_NUMBER, 50)).toThrow(/invalid version: 50/);
})

test('getCharCountBitLength - invalid mode will throw error', ({ expect }) => {
  expect(() => getCharCountBitLength(3, 2)).toThrow(/invalid mode: 3/);
})

test('getCharCountBitLength - validate result respects character count bit length table', ({ expect }) => {

  const charCountTable = [
    /*             MODE_NUMBER  MODE_ALPHA_NUM MODE_8BIT_BYTE MODE_KANJI */
    /* 1  to 9  */ 10,          9,             8,             8,
    /* 10 to 26 */ 12,          11,            16,            10,
    /* 27 to 40 */ 14,          13,            16,            12,
  ]

  let colIndex = 0
  const expectedNumberMode =   [...new Array(9).fill(charCountTable[colIndex]), ...new Array(17).fill(charCountTable[colIndex+4]), ...new Array(14).fill(charCountTable[colIndex+8])]
  const numberMode = [...Array(40).keys()].map(index => getCharCountBitLength(MODE_NUMBER, index + 1))
  colIndex++
  const expectedAlphanumMode = [...new Array(9).fill(charCountTable[colIndex]), ...new Array(17).fill(charCountTable[colIndex+4]), ...new Array(14).fill(charCountTable[colIndex+8])]
  const alphanumMode = [...Array(40).keys()].map(index => getCharCountBitLength(MODE_ALPHA_NUM, index + 1))
  colIndex++
  const expectedbit8Mode = [...new Array(9).fill(charCountTable[colIndex]), ...new Array(17).fill(charCountTable[colIndex+4]), ...new Array(14).fill(charCountTable[colIndex+8])]
  const bit8Mode = [...Array(40).keys()].map(index => getCharCountBitLength(MODE_8BIT_BYTE, index + 1))
  colIndex++
  const expectedKanjiMode = [...new Array(9).fill(charCountTable[colIndex]), ...new Array(17).fill(charCountTable[colIndex+4]), ...new Array(14).fill(charCountTable[colIndex+8])]
  const kanjiMode = [...Array(40).keys()].map(index => getCharCountBitLength(MODE_KANJI, index + 1))

  expect({numberMode, alphanumMode, bit8Mode, kanjiMode}).toEqual({
    numberMode: expectedNumberMode, 
    alphanumMode: expectedAlphanumMode, 
    bit8Mode: expectedbit8Mode, 
    kanjiMode: expectedKanjiMode
  })
})

