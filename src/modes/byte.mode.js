import { MODE_8BIT_BYTE } from "../utils/qr-mode.constants.js";
import { textToBytes } from "../utils/text-decode-encode.util.js";

export class Qr8BitByte {

  /**
   * 
   * @param {string} data 
   */
  constructor(data){
    this.data = data
    this.bytes = textToBytes(data)
  }

  get mode(){
    return MODE_8BIT_BYTE
  }

  get length(){
    return this.bytes.length
  }

  /** @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer*/
  write(buffer){
    for (const byte of this.bytes) {
        buffer.put(byte, 8);
      }
  }

}


Object.defineProperty(Qr8BitByte.prototype, 'mode', {enumerable: true});
