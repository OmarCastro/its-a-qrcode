import { MODE_KANJI } from './mode-bits.constants.js'
import { textToSjisBytes } from '../utils/text-decode-encode.util.js'

/**
 * Create QR code Kanji mode object
 * @param {string} data - data of mode object
 * @returns {import('./mode-bits.constants.js').ModeObject & {readonly bytes: Uint8Array}} created mode object
 */
export const QrKanji = (data) => {
  const bytes = textToSjisBytes(data)
  return Object.freeze({
    data,
    bytes,
    mode: MODE_KANJI,
    length: ~~(bytes.length / 2),
    write: writeDataToBitBuffer.bind(null, bytes),
  })
}

/**
 * Writes kanji data to bit buffer that will be used to generate the QR code
 * @param {Uint8Array} bytes - QrKanji mode object data byte array
 * @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer - target bit buffer
 */
function writeDataToBitBuffer (bytes, buffer) {
  let i = 0

  while (i + 1 < bytes.length) {
    let c = ((0xff & bytes[i]) << 8) | (0xff & bytes[i + 1])

    if (c >= 0x8140 && c <= 0x9FFC) {
      c -= 0x8140
    } else if (c >= 0xE040 && c <= 0xEBBF) {
      c -= 0xC140
    } else {
      throw Error(`illegal char at ${i + 1}/${c}`)
    }

    c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff)
    buffer.put(c, 13)
    i += 2
  }

  if (i < bytes.length) {
    throw Error(`illegal char at ${i + 1}`)
  }
}

/**
 * @param {string} text - text to validate
 * @returns {import('./mode-bits.constants.js').ModeObject & {readonly bytes: Uint8Array} | null} created mode object or null if invalid
 */
export function getValidQrKanjiOrNull (text) {
  const modeObject = QrKanji(text)
  const { bytes } = modeObject
  if (bytes.length % 2 === 1) {
    return null
  }
  let i = 0

  while (i + 1 < bytes.length) {
    const c = ((0xff & bytes[i]) << 8) | (0xff & bytes[i + 1])
    if (!(
      (c >= 0x8140 && c <= 0x9FFC) ||
      (c >= 0xE040 && c <= 0xEBBF)
    )) {
      return null
    }
    i += 2
  }
  return modeObject
}
