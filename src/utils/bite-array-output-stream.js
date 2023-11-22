export class ByteArrayOutputStream {
  /** @type {number[]} */
  #bytes = []

  /**
   *
   * @param {number} b - byte value
   */
  writeByte (b) {
    this.#bytes.push(b & 0xff)
  };

  /**
   *
   * @param {number} i - 2 byte little-endian numeric value
   */
  writeShort (i) {
    this.writeByte(i)
    this.writeByte(i >>> 8)
  };

  /**
   * @param {ArrayLike<number>} b - byte array
   * @param {number} [offset] - starting position
   * @param {number} [length] - array length to copy
   */
  writeBytes (b, offset = 0, length = b.length) {
    for (let i = 0; i < length; i += 1) {
      this.writeByte(b[i + offset])
    }
  };

  /**
   *
   * @param {string} str - charcode list
   */
  writeString (str) {
    for (let i = 0, e = str.length; i < e; i += 1) {
      this.writeByte(str.charCodeAt(i))
    }
  };

  toByteArray () {
    return Uint8Array.from(this.#bytes)
  };

  toString () {
    return JSON.stringify(this.#bytes)
  };
}
