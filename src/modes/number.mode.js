import { MODE_NUMBER } from "../utils/qr-mode.constants";

export class QrNumber {

  /**
   * 
   * @param {string} data 
   */
  constructor(data){
    this.data = data
  }

  get mode(){
    return MODE_NUMBER
  }

  get length(){
    return this.data.length
  }

  /** @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer*/
  write(buffer){
    const {data} = this;
    
    let i = 0;

    while (i + 2 < data.length) {
      buffer.put(strToNum(data.substring(i, i + 3) ), 10);
      i += 3;
    }

    if (i < data.length) {
      if (data.length - i == 1) {
        buffer.put(strToNum(data.substring(i, i + 1) ), 4);
      } else if (data.length - i == 2) {
        buffer.put(strToNum(data.substring(i, i + 2) ), 7);
      }
    }
    
  }
}

/**
 * 
 * @param {string} s 
 * @returns 
 */
function strToNum(s) {
  var num = 0;
  for (var i = 0; i < s.length; i += 1) {
    num = num * 10 + charToNum(s.charAt(i) );
  }
  return num;
};

/**
 * 
 * @param {string} c
 * @returns 
 */
function charToNum(c) {
  if ('0' <= c && c <= '9') {
    return c.charCodeAt(0) - '0'.charCodeAt(0);
  }
  throw 'illegal char :' + c;
};
