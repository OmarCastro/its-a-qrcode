import { MODE_KANJI } from "../utils/qr-mode.constants.js";
import { textToSjisBytes } from "../utils/text-decode-encode.util.js";

export class QrKanji {

  /**
   * 
   * @param {string} data 
   */
  constructor(data){
    this.data = data
    this.bytes = textToSjisBytes(data)
  }

  get mode(){
    return MODE_KANJI
  }

  get length(){
    return ~~(this.bytes.length / 2);
  }

  /** @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer*/
  write(buffer){
    var data = this.bytes;
  
    var i = 0;

    while (i + 1 < data.length) {

      var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

      if (0x8140 <= c && c <= 0x9FFC) {
        c -= 0x8140;
      } else if (0xE040 <= c && c <= 0xEBBF) {
        c -= 0xC140;
      } else {
        throw 'illegal char at ' + (i + 1) + '/' + c;
      }

      c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

      buffer.put(c, 13);

      i += 2;
    }

    if (i < data.length) {
      throw 'illegal char at ' + (i + 1);
    }
  }

}
