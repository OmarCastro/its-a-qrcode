import { MODE_KANJI } from '../utils/qr-mode.constants.js'
import { textToSjisBytes } from '../utils/text-decode-encode.util.js'

/**
 * Create QR code numeric mode object
 *
 * @param {string} data
 */
export const QrKanji = (data) => {
  const bytes = textToSjisBytes(data)
  return Object.freeze({
    data,
    mode: MODE_KANJI,
    length: ~~(bytes.length / 2),
    write: writeDataToBitBuffer.bind(null, bytes),
  })
}

/**
 * Writes kanji data to bit buffer that will be used to generate the QR code
 *
 * @param {Uint8Array} data
 * @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer
 */
function writeDataToBitBuffer (data, buffer) {
  let i = 0

  while (i + 1 < data.length) {
    let c = ((0xff & data[i]) << 8) | (0xff & data[i + 1])

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

  if (i < data.length) {
    throw Error(`illegal char at ${i + 1}`)
  }
}
