import { gexp, glog } from './qr-math.util.js'

class QRPolynomial {
  /** @type {Uint32Array} */
  array

  /**
   * @param {ArrayLike<number>} num - polinomial value
   * @param {number} shift - shift value
   */
  constructor (num, shift = 0) {
    let offset = 0
    const numLen = num.length

    while (offset < numLen && num[offset] === 0) {
      offset += 1
    }
    const lengthAfterOffset = numLen - offset
    const array = new Uint32Array(lengthAfterOffset + shift)
    for (let i = 0; i < lengthAfterOffset; i += 1) {
      array[i] = num[i + offset]
    }

    this.array = array
  }

  /** @param {number} index - value position */
  getAt (index) {
    return this.array[index]
  }

  get length () {
    return this.array.length
  }

  /**
   * @param {QRPolynomial} other - right side of operation
   * @returns {QRPolynomial} multiplication result
   */
  multiply (other) {
    const { length, array } = this
    const { length: otherLength, array: otherArray } = other

    const num = new Array(length + otherLength - 1)

    for (let i = 0; i < length; i += 1) {
      for (let j = 0; j < otherLength; j += 1) {
        num[i + j] ^= gexp(glog(array[i]) + glog(otherArray[j]))
      }
    }

    return new QRPolynomial(num, 0)
  }

  /**
   * @param {Readonly<QRPolynomial>} other - right side of operation
   * @returns {QRPolynomial} mod result
   */
  mod (other) {
    const { length, array } = this
    const { length: otherLength, array: otherArray } = other

    if (length - otherLength < 0) {
      return this
    }

    const ratio = glog(array[0]) - glog(otherArray[0])

    const num = Uint32Array.from(array)

    for (let i = 0; i < otherLength; i += 1) {
      num[i] ^= gexp(glog(otherArray[i]) + ratio)
    }

    // recursive call
    return new QRPolynomial(num, 0).mod(other)
  };
}

/**
 * Transforms array into a polynomial
 * @param {ArrayLike<number>} num - polynomial values
 * @param {number} [shift] - shift value
 * @returns {QRPolynomial} polynomial
 */
export function QrPolynomial (num, shift = 0) {
  return new QRPolynomial(num, shift)
};
