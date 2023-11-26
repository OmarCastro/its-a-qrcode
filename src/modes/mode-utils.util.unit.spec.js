import { test } from '../../test-utils/unit/test.util.js'
import { getBestMode } from './mode-utils.util.js'
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
