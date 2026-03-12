export class QrBitBuffer {
  /** @type {number[]} */
  #byteBuffer = []
  #bitLength = 0

  /**
   * Append bit sequence to bit buffer
   * @param {number} num - bit sequence as number
   * @param {number} length - bit sequence length
   */
  put (num, length) {
    const byteBuffer = this.#byteBuffer
    const bitLength = this.#bitLength
    const newBitLength = bitLength + length
    const newBufferLength = (newBitLength + 7) >> 3

    let restBits = Math.min((byteBuffer.length << 3) - bitLength, length)
    let bufIndex = bitLength >> 3
    while (byteBuffer.length < newBufferLength) {
      byteBuffer.push(0)
    }
    let i = 0
    if (restBits === 0) {
      restBits = Math.min(8, length)
    }
    while (i < length) {
      const shiftLeft = bufIndex === newBufferLength - 1 ? (8 - restBits) : 0
      byteBuffer[bufIndex] |= (num << shiftLeft >>> (length - i - restBits)) & (0xff)
      i += restBits
      bufIndex++
      restBits = Math.min(8, length - i)
    }
    this.#bitLength = newBitLength
  };

  get byteBuffer () {
    return this.#byteBuffer.slice()
  }

  toByteArray () {
    return Uint8Array.from(this.#byteBuffer)
  }

  get bitLength () {
    return this.#bitLength
  }

  /**
   * Get bit value at index, value is either 0 or 1
   * @param {number} index - index position
   * @returns {number} bit value
   */
  getBitAt (index) {
    const bufIndex = index >> 3
    return (this.#byteBuffer[bufIndex] >>> (7 - index & 0b111)) & 1
  }

  /**
   * @param {0|1|boolean} bit bit to put
   */
  putBit (bit) {
    const byteBuffer = this.#byteBuffer
    const bitLength = this.#bitLength
    const bufIndex = bitLength >> 3
    if (byteBuffer.length <= bufIndex) {
      byteBuffer.push(0)
    }

    if (bit) {
      byteBuffer[bufIndex] |= (0x80 >>> (bitLength & 0b111))
    }
    this.#bitLength += 1
  }
}
