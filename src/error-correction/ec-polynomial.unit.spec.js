import { test } from '../../test-utils/unit/test.util.js'
import { QrPolynomial } from '../utils/qr-polynomial.js'
import { gexp } from '../utils/qr-math.util.js'
import { getErrorCorrectPolynomial } from './ec-polynomial.js'
import { EC_BLOCK_TABLE } from './qr-ec-block-table.constants.js'

const maxEcWidth = Math.max(...EC_BLOCK_TABLE.filter((_, i) => i % 2 === 0))
const maxEcWidthRange = Object.freeze([...new Array(maxEcWidth).keys()])

/** original and simplified implementation of getErrorCorrectPolynomial */
export function getErrorCorrectPolynomialOriginal (errorCorrectLength) {
  let polynomial = QrPolynomial([1], 0)
  for (let i = 0; i < errorCorrectLength; i += 1) {
    polynomial = polynomial.multiply(QrPolynomial([1, gexp(i)], 0))
  }
  return polynomial
};


test('Error Correction Polynomial - values are memoized', ({ expect }) => {
  const checks = maxEcWidthRange.map((index) => getErrorCorrectPolynomial(index) === getErrorCorrectPolynomial(index))
  const expeced = maxEcWidthRange.map(() => true)
  expect(checks).toEqual(expeced)
})

test(`memoized shows the same value as the original from 0 to max possible ECC count (${maxEcWidth}) `, ({ expect }) => {
  const originalVals = maxEcWidthRange.map((index) => getErrorCorrectPolynomialOriginal(index))
  const updatedVals = maxEcWidthRange.map((index) => getErrorCorrectPolynomial(index))
  expect(originalVals).toEqual(updatedVals)
})

