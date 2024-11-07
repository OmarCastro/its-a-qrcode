import { getUtf8ToJisTable } from './utf8-to-jis-table.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const sjisDecoder = new TextDecoder('sjis')

/**
 * @param {string} str - input text
 * @returns {Uint8Array} utf8 encoded byte array
 */
export const textToBytes = (str) => encoder.encode(str)

/**
 * @param {Uint8Array} bytes - utf8 encoded byte array
 * @returns {string} decoded output
 */
export const bytesToText = (bytes) => decoder.decode(bytes)

/**
 * @param {string} base64 - input base64 text
 * @returns {Uint8Array} byte array
 */
export const base64ToBytes = (base64) => Uint8Array.from(atob(base64), (m) => /** @type {number} */(m.codePointAt(0)))

/**
 * @param {Uint8Array} bytes - byte array
 * @returns {string} base64 text
 */
export const bytesToBase64 = (bytes) => btoa(Array.from(bytes, (x) => String.fromCodePoint(x)).join(''))

/**
 * @param {string} str - input text
 * @returns {string} encoded input text in base64
 */
export const textToBase64 = (str) => bytesToBase64(encoder.encode(str))

/**
 * @param {string} base64 - input base64 text
 * @returns {string} decoded input text
 */
export const base64ToText = (base64) => decoder.decode(base64ToBytes(base64))

/**
 * @param {string} hex - hex string
 * @returns {string} converted string in base64
 */
export const hexToBase64 = (hex) => bytesToBase64(hexToBytes(hex))

/**
 * @param {string} base64 - input base64 text
 * @returns {string} converted string in hexadecimal
 */
export const base64ToHex = (base64) => bytesToHex(base64ToBytes(base64))

/**
 * @param {string} hex - hex string
 * @returns {Uint8Array} byte array
 */
export function hexToBytes (hex) {
  const bytes = []
  for (let c = 0, e = hex.length; c < e; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16))
  }
  return Uint8Array.from(bytes)
}

/**
 * @param {Uint8Array} bytes - byte array
 * @returns {string} hex string
 */
export const bytesToHex = (bytes) => Array.from(bytes).map(byte => ((byte + 256) & 0xff).toString(16)).join('')

/**
 * @param {string} str - input text
 * @returns {Uint8Array} SJIS encoded byte array
 */
export const textToSjisBytes = (str) => UTF8ToSJIS(textToBytes(str))

/**
 * @param {Uint8Array} bytes - SJIS encoded byte array
 * @returns {string} decoded output
 */
export const sjisBytesToText = (bytes) => sjisDecoder.decode(bytes)

/**
 * @param {Uint8Array} data - utf8 encoded byte array
 * @returns {Uint8Array} SJIS encoded byte array
 */
// eslint-disable-next-line sonarjs/cognitive-complexity -- its low level, it is meant to be complex
function UTF8ToSJIS (data) {
  const FALLBACK_CHARACTER = 63 // '?'
  const UTF8_TO_JIS_TABLE = getUtf8ToJisTable()

  /** @type {number[]} */
  const results = []
  const len = data?.length
  let b1, b2, utf8, jis

  for (let i = 0; i < len; i++) {
    const b = data[i]

    if (b >= 0x80) {
      if (b <= 0xDF) {
        // 2 bytes
        utf8 = (b << 8) + data[++i]
      } else if (b <= 0xEF) {
        // 3 bytes
        utf8 = (b << 16) +
               (data[++i] << 8) +
               (data[++i] & 0xFF)
      } else {
        // 4 bytes
        utf8 = (b << 24) +
               (data[++i] << 16) +
               (data[++i] << 8) +
               (data[++i] & 0xFF)
      }

      jis = UTF8_TO_JIS_TABLE[utf8]
      if (jis == null) {
        results[results.length] = FALLBACK_CHARACTER
      } else {
        if (jis < 0xFF) {
          results[results.length] = jis + 0x80
        } else {
          if (jis > 0x10000) {
            jis -= 0x10000
          }

          b1 = jis >> 8
          b2 = jis & 0xFF
          if (b1 & 0x01) {
            b1 >>= 1
            if (b1 < 0x2F) {
              b1 += 0x71
            } else {
              b1 -= 0x4F
            }
            b2 += b2 > 0x5F ? 0x20 : 0x1F
          } else {
            b1 >>= 1
            if (b1 <= 0x2F) {
              b1 += 0x70
            } else {
              b1 -= 0x50
            }
            b2 += 0x7E
          }
          results[results.length] = b1 & 0xFF
          results[results.length] = b2 & 0xFF
        }
      }
    } else {
      results[results.length] = data[i] & 0xFF
    }
  }

  return Uint8Array.from(results)
}
