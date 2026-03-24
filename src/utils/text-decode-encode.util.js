const encoder = new TextEncoder()
const decoder = new TextDecoder()

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
export const base64ToBytes = (() => {
  if(typeof Uint8Array.fromBase64 === "function"){
    return Uint8Array.fromBase64
  }
  return (/** @type {string} */ base64) => Uint8Array.from(atob(base64), (m) => /** @type {number} */(m.codePointAt(0)))
})()
/**
 * @param {Uint8Array} bytes - byte array
 * @returns {string} base64 text
 */
export const bytesToBase64 = (() => {
  if(typeof Uint8Array.prototype.toBase64 === "function"){
    return (/** @type {Uint8Array} */ bytes) => bytes.toBase64()
  }
  return (/** @type {Uint8Array} */ bytes) => btoa(Array.from(bytes, (x) => String.fromCodePoint(x)).join(''))
})()

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
export const hexToBytes = (() => {
  if(typeof Uint8Array.fromHex === "function"){
    return Uint8Array.fromHex
  }
  return (/** @type {string} */ hex) => Uint8Array.from({ length: hex.length >> 1 }, (_, i) => Number.parseInt(hex.slice(i, i + 2), 16))
})()

/**
 * @param {Uint8Array} bytes - byte array
 * @returns {string} hex string
 */
export const bytesToHex = (() => {
  if(typeof Uint8Array.prototype.toHex === "function"){
    return (/** @type {Uint8Array} */ bytes) => bytes.toHex()
  }
  const byteToHex = Array.from({ length: 0xff }, (_, i) => i.toString(16).padStart(2, '0'))
  return (/** @type {Uint8Array} */ bytes) => bytes.reduce((result, byte) => result + byteToHex[byte], '')
})()
