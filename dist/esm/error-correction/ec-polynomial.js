import { QrPolynomial } from '../utils/qr-polynomial'
import { gexp } from '../utils/qr-math.util'

/**
 * memoize getErrorCorrectPolynomial as it is called multiple times when generating QR Code
 */
const memoECPolynomials = [
  QrPolynomial([1], 0),
]

/**
 * @param {number} errorCorrectLength - error correction codeword count
 * @returns {ReturnType<QrPolynomial>} error correction polynomial
 */
export function getErrorCorrectPolynomial (errorCorrectLength) {
  if (memoECPolynomials.length > errorCorrectLength) {
    return memoECPolynomials[errorCorrectLength]
  }
  const lastIndex = memoECPolynomials.length - 1
  let polynomial = memoECPolynomials[lastIndex]
  for (let i = lastIndex; i < errorCorrectLength; i += 1) {
    polynomial = polynomial.multiply(QrPolynomial([1, gexp(i)], 0))
    memoECPolynomials.push(polynomial)
  }
  return polynomial
};
