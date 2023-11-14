export const MODE_NUMBER = 0b0001
export const MODE_ALPHA_NUM = 0b0010
export const MODE_8BIT_BYTE = 0b0100
export const MODE_KANJI = 0b1000

/**
 * @typedef {object} ModeObject
 * @property {string} data - mode data
 * @property {number} mode - mode bit sequence
 * @property {number} length - mode data length in bytes
 * @property {(buffer: import("./../utils/qr-bit-buffer.js").QrBitBuffer) => any} write - write to QrBitBuffer method
 */
