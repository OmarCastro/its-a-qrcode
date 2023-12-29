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
