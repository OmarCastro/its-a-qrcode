import { MODE_ALPHA_NUM } from "../utils/qr-mode.constants";

export class QrAlphaNum {

  /**
   * 
   * @param {string} data 
   */
  constructor(data){
    this.data = data
  }

  get mode(){
    return MODE_ALPHA_NUM
  }

  get length(){
    return this.data.length
  }

  /** @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer*/
  write(buffer){
    const {data} = this;
    
    let i = 0;

    while (i + 1 < data.length) {
        buffer.put(
            getCode(data.charAt(i) ) * 45 +
            getCode(data.charAt(i + 1) ), 11);
        i += 2;
    }

    if (i < data.length) {
        buffer.put(getCode(data.charAt(i) ), 6);
    }
    
  }
}

/**
 * Get value for character `c`
 * 
 * @param {string} c character
 * @returns 
 */
function getCode(c) {
    
    if ('0' <= c && c <= '9') {
      return c.charCodeAt(0) - '0'.charCodeAt(0);
    } else if ('A' <= c && c <= 'Z') {
      return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else {
      switch (c) {
      case ' ' : return 36;
      case '$' : return 37;
      case '%' : return 38;
      case '*' : return 39;
      case '+' : return 40;
      case '-' : return 41;
      case '.' : return 42;
      case '/' : return 43;
      case ':' : return 44;
      default :
        throw 'illegal char :' + c;
      }
    }
  };

