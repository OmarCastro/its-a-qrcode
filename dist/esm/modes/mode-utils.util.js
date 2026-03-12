import { QrNumber } from './number.mode.js'
import { QrAlphaNum } from './alphanum.mode.js'
import { getValidQrKanjiOrNull } from './kanji.mode.js'
import { Qr8BitByte } from './byte.mode.js'

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

const LENGTH_BITS_MATRIX = Object.freeze([
  10, 12, 14, // MODE_NUMBER
  9, 11, 13, // MODE_ALPHA_NUM
  8, 16, 16, // MODE_8BIT_BYTE
  8, 10, 12, // MODE_KANJI
])

/**
 * @param {number} mode - mode value
 * @param {number} version - qr version
 * @returns {number} the number of bits in character count indicator
 */
export function getCharCountBitLength (mode, version) {
  if (!(version >= 1 && version < 41)) {
    throw Error(`invalid version: ${version}`)
  }
  if (mode < 1 || mode > 8 || (mode & (mode - 1))) {
    throw Error(`invalid mode: ${mode}`)
  }
  const modeIndex = 31 - Math.clz32(mode)
  const bitsIndex = version > 26 ? 2 : version > 9 ? 1 : 0
  return LENGTH_BITS_MATRIX[modeIndex * 3 + bitsIndex]
};
