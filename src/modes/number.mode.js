import { MODE_NUMBER } from './mode-bits.constants.js'

/**
 * Create QR code numeric mode object
 * @param {string} data - data of mode object
 * @returns {import('./mode-bits.constants.js').ModeObject} created mode object
 */
export const QrNumber = (data) => Object.freeze({
  data,
  mode: MODE_NUMBER,
  length: data.length,
  write: writeDataToBitBuffer.bind(null, data),
})

/**
 * Writes numeric data to bit buffer that will be used to generate the QR code
 * @param {string} data - QrNumber mode object data
 * @param {import("./../utils/qr-bit-buffer.js").QrBitBuffer} buffer - target bit buffer
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
 * @param {string} s - target string
 * @returns {number} `s` as number
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
 * @param {string} c - target character
 * @returns {number} `c` as number
 */
function charToNum (c) {
  if (c >= '0' && c <= '9') {
    return c.charCodeAt(0) - zeroCharCode
  }
  throw Error(`illegal char: ${c}`)
};

const zeroCharCode = '0'.charCodeAt(0)
