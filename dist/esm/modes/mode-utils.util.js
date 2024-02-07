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

/** @type {{[mode: number]: number[]}} */
const CharCountBitLengthTable = {
  [MODE_NUMBER]:    [10, 12, 14],
  [MODE_ALPHA_NUM]: [9, 11, 13],
  [MODE_8BIT_BYTE]: [8, 16, 16],
  [MODE_KANJI]:     [8, 10, 12],
}

/**
 * @param {number} mode - mode balue
 * @param {number} type - qr version
 * @returns {number} the number of bits in character count indicator
 */
export function getCharCountBitLength (mode, type) {
  if (!(type >= 1 && type < 41)) {
    throw Error(`invalid type: ${type}`)
  }
  const typesBitLength = CharCountBitLengthTable[mode]
  if (!typesBitLength) {
    throw Error(`invalid mode: ${mode}`)
  }
  const typeIndex = type < 10 ? 0 : type < 27 ? 1 : 2
  return typesBitLength[typeIndex]
};
