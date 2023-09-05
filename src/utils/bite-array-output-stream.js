
export class ByteArrayOutputStream {
  /** @type {number[]} */
  #bytes = []

  
  /**
   * 
   * @param {number} b 
   */
  writeByte(b) {
    this.#bytes.push(b & 0xff);
  };

  /**
   * 
   * @param {number} i
   */
  writeShort(i) {
    this.writeByte(i);
    this.writeByte(i >>> 8);
  };

  /**
   *  
   * @param {ArrayLike<number>} b
   * @param {number} [offset]
   * @param {number} [length]
   */
  writeBytes(b, offset = 0, length = b.length) {
    for (var i = 0; i < length; i += 1) {
      this.writeByte(b[i + offset]);
    }
  };

  /**
   * 
   * @param {string} str
   */
  writeString(str) {
    for (var i = 0, e = str.length; i < e; i += 1) {
      this.writeByte(str.charCodeAt(i) );
    }
  };

  toByteArray() {
    return Uint8Array.from(this.#bytes);
  };

  toString() {
    return JSON.stringify(this.#bytes)
  };

  
}


