import { test } from '../../test-utils/unit/test.util.js'
import { fromString, isValid } from './ec-level.js'



test('Error Correction Level - fromString returns correct value and is case insesitive', ({ expect }) => {
  const LECL = {name: "Low", bit: 1}
  const MECL = {name: "Medium", bit: 0}
  const QECL = {name: "Quartile", bit: 3}
  const HECL = {name: "High", bit: 2}
  const entries = ["L", "Low", "LoW", "M", "Medium", "MeDiUM", "Q", "quartile", "QUARTILE", "H", "High", "hIGh"]
  const result = [LECL ,LECL, LECL, MECL, MECL, MECL, QECL, QECL, QECL, HECL, HECL, HECL]
  expect(entries.map(fromString)).toEqual(result)
})

test('Error Correction Level - fromString throws error on invalid type', ({ expect }) => {
  const entries = [1, null, undefined, NaN, [], {}]
  const result = [...entries].map(entry => `expected string instead of ${typeof entry}`)
  expect(entries.map((entry) => {
    try { 
      fromString(entry)
      return 'no error thrown'
    } catch (error) {
      return error.message
    }
  })).toEqual(result)
})

test('Error Correction Level - fromString throws error on invalid value', ({ expect }) => {
  const entries = ["Lo", "Lw", "mid", 'med']
  const result = [...entries].map(entry => `Unknown Error Correction Level: "${entry}" expected one of the following values (case insensitive): "L", "Low", "M", "Medium", "Q", "Quartile", "H", "High"`)
  expect(entries.map((entry) => {
    try { 
      fromString(entry)
      return 'no error thrown'
    } catch (error) {
      return error.message
    }
  })).toEqual(result)
})


test('Error Correction Level - isValid returns true on valid values', ({ expect }) => {
  const entries = ["L", "Low", "LoW", "M", "Medium", "MeDiUM", "Q", "quartile", "QUARTILE", "H", "High", "hIGh"]
  const result = [...entries].fill(true)
  expect(entries.map(isValid)).toEqual(result)
})

test('Error Correction Level - isValid returns false on invalid values', ({ expect }) => {
  const entries = ["Lo", "Lw", "mid", null, undefined, 1, {}, /Lo/g, 0, NaN]
  const result = [...entries].fill(false)
  expect(entries.map(isValid)).toEqual(result)
})
