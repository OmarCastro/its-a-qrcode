import { MODE_NUMBER } from '../utils/qr-mode.constants.js'

/**
 * Create QR code numeric mode object
 *
 * @param {string} data
 */
export const QrNumber = (data) => Object.freeze({
  data,
  mode: MODE_NUMBER,
  length: data.length,
  write: writeDataToBitBuffer.bind(null, data),
})

/**
 * Writes numeric data to bit buffer that will be used to generate the QR code
 *
 * @param {string} data
 * @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer
 */
function writeDataToBitBuffer (data, buffer) {
  let i = 0

  while (i + 2 < data.length) {
    buffer.put(strToNum(data.substring(i, i + 3)), 10)
    i += 3
  }

  if (i < data.length) {
    if (data.length - i === 1) {
      buffer.put(strToNum(data.substring(i, i + 1)), 4)
    } else if (data.length - i === 2) {
      buffer.put(strToNum(data.substring(i, i + 2)), 7)
    }
  }
}

/**
 *
 * @param {string} s
 * @returns
 */
function strToNum (s) {
  let num = 0
  for (let i = 0, e = s.length; i < e; i++) {
    num = num * 10 + charToNum(s.charAt(i))
  }
  return num
};

/**
 *
 * @param {string} c
 * @returns
 */
function charToNum (c) {
  if (c >= '0' && c <= '9') {
    return c.charCodeAt(0) - zeroCharCode
  }
  throw Error(`illegal char: ${c}`)
};

const zeroCharCode = '0'.charCodeAt(0)
