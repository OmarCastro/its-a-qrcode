import { QrNumber } from './number.mode.js'
import { QrAlphaNum } from './alphanum.mode.js'
import { getValidQrKanjiOrNull } from './kanji.mode.js'
import { Qr8BitByte } from './byte.mode.js'
import { MODE_8BIT_BYTE, MODE_ALPHA_NUM, MODE_KANJI, MODE_NUMBER } from '../modes/mode-bits.constants.js'

/**
 * Create QR code Kanji mode object
 * @param {string} data - data of mode object
 * @returns {import('./mode-bits.constants.js').ModeObject} get best matching mode
 */
export function getBestMode (data) {
  if (/^\d+$/.test(data)) {
    return QrNumber(data)
  }
  if (/^[0-9A-Z $%*+-./:]+$/.test(data)) {
    return QrAlphaNum(data)
  }
  return getValidQrKanjiOrNull(data) ?? Qr8BitByte(data)
}

/**
 * @param {number} mode - mode balue
 * @param {number} type - qr version
 * @returns {number} the number of bits in character count indicator
 */
export function getCharCountBitLength (mode, type) {
  if (type >= 1 && type < 10) { // 1 - 9
    switch (mode) {
      case MODE_NUMBER : return 10
      case MODE_ALPHA_NUM : return 9
      case MODE_8BIT_BYTE : return 8
      case MODE_KANJI : return 8
      default :
        throw Error(`invalid mode: ${mode}`)
    }
  } else if (type < 27) { // 10 - 26
    switch (mode) {
      case MODE_NUMBER : return 12
      case MODE_ALPHA_NUM : return 11
      case MODE_8BIT_BYTE : return 16
      case MODE_KANJI : return 10
      default :
        throw Error(`invalid mode: ${mode}`)
    }
  } else if (type < 41) { // 27 - 40
    switch (mode) {
      case MODE_NUMBER : return 14
      case MODE_ALPHA_NUM : return 13
      case MODE_8BIT_BYTE : return 16
      case MODE_KANJI : return 12
      default :
        throw Error(`invalid mode: ${mode}`)
    }
  } else {
    throw Error(`invalid type: ${type}`)
  }
};
