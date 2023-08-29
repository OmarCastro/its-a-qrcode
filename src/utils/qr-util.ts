import { PATTERN_POSITION_TABLE } from "./pattern-position-table.constants.js";
import { QrPolynomial } from "./qr-polynomial.js";
import * as QRMath from './qr-math.js'
import { MODE_8BIT_BYTE, MODE_ALPHA_NUM,MODE_KANJI, MODE_NUMBER } from './qr-mode.constants.js'

function getBCHDigit(data: number) {
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

export function getBCHTypeInfo(data: number) {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
  }
  return ( (data << 10) | d) ^ G15_MASK;
};

export function getBCHTypeNumber(data: number) {
  var d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
  }
  return (data << 12) | d;
};

export const getPatternPosition = (typeNumber) => PATTERN_POSITION_TABLE[typeNumber - 1];


const maskPatternFunctions = [
  (i, j) => (i + j) % 2 == 0,                                   // QRMaskPattern.PATTERN000
  (i, _) => i % 2 == 0,                                         // QRMaskPattern.PATTERN001
  (_, j) => j % 3 == 0,                                         // QRMaskPattern.PATTERN010
  (i, j) => (i + j) % 3 == 0,                                   // QRMaskPattern.PATTERN011
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0,  // QRMaskPattern.PATTERN100
  (i, j) => (i * j) % 2 + (i * j) % 3 == 0,                     // QRMaskPattern.PATTERN101
  (i, j) => ( (i * j) % 2 + (i * j) % 3) % 2 == 0,              // QRMaskPattern.PATTERN110
  (i, j) =>( (i * j) % 3 + (i + j) % 2) % 2 == 0,               // QRMaskPattern.PATTERN110
] as ((i: number, j: number) => boolean)[]

export function getMaskFunction (maskPattern: number) {
  const result = maskPatternFunctions[maskPattern]
  if(!result){
    throw Error(`bad maskPattern: ${maskPattern}`)
  }
  return result
};


export function getErrorCorrectPolynomial (errorCorrectLength: number) {
  let polynomial = QrPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i += 1) {
    polynomial = polynomial.multiply(QrPolynomial([1, QRMath.gexp(i)], 0) );
  }
  return polynomial;
};


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

export function getLostPoint(qrcode) {

  var moduleCount = qrcode.getModuleCount();

  var lostPoint = 0;

  // LEVEL1

  for (var row = 0; row < moduleCount; row += 1) {
    for (var col = 0; col < moduleCount; col += 1) {

      var sameCount = 0;
      var dark = qrcode.isDark(row, col);

      for (var r = -1; r <= 1; r += 1) {

        if (row + r < 0 || moduleCount <= row + r) {
          continue;
        }

        for (var c = -1; c <= 1; c += 1) {

          if (col + c < 0 || moduleCount <= col + c) {
            continue;
          }

          if (r == 0 && c == 0) {
            continue;
          }

          if (dark == qrcode.isDark(row + r, col + c) ) {
            sameCount += 1;
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += (3 + sameCount - 5);
      }
    }
  };

  // LEVEL2

  for (var row = 0; row < moduleCount - 1; row += 1) {
    for (var col = 0; col < moduleCount - 1; col += 1) {
      var count = 0;
      if (qrcode.isDark(row, col) ) count += 1;
      if (qrcode.isDark(row + 1, col) ) count += 1;
      if (qrcode.isDark(row, col + 1) ) count += 1;
      if (qrcode.isDark(row + 1, col + 1) ) count += 1;
      if (count == 0 || count == 4) {
        lostPoint += 3;
      }
    }
  }

  // LEVEL3

  for (var row = 0; row < moduleCount; row += 1) {
    for (var col = 0; col < moduleCount - 6; col += 1) {
      if (qrcode.isDark(row, col)
          && !qrcode.isDark(row, col + 1)
          &&  qrcode.isDark(row, col + 2)
          &&  qrcode.isDark(row, col + 3)
          &&  qrcode.isDark(row, col + 4)
          && !qrcode.isDark(row, col + 5)
          &&  qrcode.isDark(row, col + 6) ) {
        lostPoint += 40;
      }
    }
  }

  for (var col = 0; col < moduleCount; col += 1) {
    for (var row = 0; row < moduleCount - 6; row += 1) {
      if (qrcode.isDark(row, col)
          && !qrcode.isDark(row + 1, col)
          &&  qrcode.isDark(row + 2, col)
          &&  qrcode.isDark(row + 3, col)
          &&  qrcode.isDark(row + 4, col)
          && !qrcode.isDark(row + 5, col)
          &&  qrcode.isDark(row + 6, col) ) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4

  var darkCount = 0;

  for (var col = 0; col < moduleCount; col += 1) {
    for (var row = 0; row < moduleCount; row += 1) {
      if (qrcode.isDark(row, col) ) {
        darkCount += 1;
      }
    }
  }

  var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
  lostPoint += ratio * 10;

  return lostPoint;
};
