import { MODE_8BIT_BYTE } from '../utils/qr-mode.constants.js'
import { textToBytes } from '../utils/text-decode-encode.util.js'

/**
 * Create QR code byte mode object
 * @param {string} data
 */
export const Qr8BitByte = (data) => Object.freeze({
  data,
  mode: MODE_8BIT_BYTE,
  length: data.length,
  write: writeDataToBitBuffer.bind(null, textToBytes(data)),
})

/**
 * Writes byte data to bit buffer that will be used to generate the QR code
 *
 * @param {Uint8Array} data
 * @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer
 */
function writeDataToBitBuffer (data, buffer) {
  for (const byte of data) {
    buffer.put(byte, 8)
  }
}
