import { PATTERN_POSITION_TABLE } from "./pattern-position-table.constants.js";
import { QrPolynomial } from "./qr-polynomial.js";
import * as QRMath from './qr-math.js'
import { MODE_8BIT_BYTE, MODE_ALPHA_NUM,MODE_KANJI, MODE_NUMBER } from './qr-mode.constants.js'

/** @param {number} data  */
function getBCHDigit(data) {
  let digit = 0;
  while (data != 0) {
    digit += 1;
    data >>>= 1;
  }
  return digit;
};

const G15 =      0b000010100110111
const G18 =      0b001111100100101
const G15_MASK = 0b101010000010010

/** @param {number} data  */
export function getBCHTypeInfo(data) {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
  }
  return ( (data << 10) | d) ^ G15_MASK;
};

/** @param {number} data  */
export function getBCHTypeNumber(data) {
  var d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
  }
  return (data << 12) | d;
};

/** @param {number} typeNumber  */
export const getPatternPosition = (typeNumber) => PATTERN_POSITION_TABLE[typeNumber - 1];

/** @type {((i: number, j: number) => boolean)[]} */
const maskPatternFunctions = [
  (i, j) => (i + j) % 2 == 0,                                   // QRMaskPattern.PATTERN000
  (i, _) => i % 2 == 0,                                         // QRMaskPattern.PATTERN001
  (_, j) => j % 3 == 0,                                         // QRMaskPattern.PATTERN010
  (i, j) => (i + j) % 3 == 0,                                   // QRMaskPattern.PATTERN011
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0,  // QRMaskPattern.PATTERN100
  (i, j) => (i * j) % 2 + (i * j) % 3 == 0,                     // QRMaskPattern.PATTERN101
  (i, j) => ( (i * j) % 2 + (i * j) % 3) % 2 == 0,              // QRMaskPattern.PATTERN110
  (i, j) =>( (i * j) % 3 + (i + j) % 2) % 2 == 0,               // QRMaskPattern.PATTERN110
]

/** @param {number} maskPattern  */
export function getMaskFunction (maskPattern) {
  const result = maskPatternFunctions[maskPattern]
  if(!result){
    throw Error(`bad maskPattern: ${maskPattern}`)
  }
  return result
};


/** @param {number} errorCorrectLength  */
export function getErrorCorrectPolynomial (errorCorrectLength) {
  let polynomial = QrPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i += 1) {
    polynomial = polynomial.multiply(QrPolynomial([1, QRMath.gexp(i)], 0) );
  }
  return polynomial;
};

/**
 * 
 * @param {number} mode 
 * @param {number} type 
 */
export function getLengthInBits (mode, type) {

  if (1 <= type && type < 10) {     // 1 - 9

    switch(mode) {
    case MODE_NUMBER    : return 10;
    case MODE_ALPHA_NUM : return 9;
    case MODE_8BIT_BYTE : return 8;
    case MODE_KANJI     : return 8;
    default :
      throw 'mode:' + mode;
    }

  } else if (type < 27) {    // 10 - 26

    switch(mode) {
    case MODE_NUMBER    : return 12;
    case MODE_ALPHA_NUM : return 11;
    case MODE_8BIT_BYTE : return 16;
    case MODE_KANJI     : return 10;
    default :
      throw 'mode:' + mode;
    }

  } else if (type < 41) {   // 27 - 40

    switch(mode) {
    case MODE_NUMBER    : return 14;
    case MODE_ALPHA_NUM : return 13;
    case MODE_8BIT_BYTE : return 16;
    case MODE_KANJI     : return 12;
    default :
      throw 'mode:' + mode;
    }

  } else {
    throw 'type:' + type;
  }
};

