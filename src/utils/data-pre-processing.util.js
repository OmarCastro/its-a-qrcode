/**
 * @param {string} data - QR code data
 * @returns {string} unprocessed data
 */
const none = (data) => data

/**
 * @param {string} data - QR code data
 * @returns {string} trimmed QR code data
 */
const trim = (data) => data.trim()

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with trimmed lines
 */
const trimLines = (data) => data.split('\n').map(line => line.trim()).join('\n')

const preProcessMap = {
  none,
  trim,
  'trim-lines': trimLines,
}

/**
 * Process QR code element text element before transforming to QRCode
 * @param {string} data - QR code element text element
 * @param {string} preprocessConfig - QR code data-content attribute
 * @returns {string} processed data
 */
function preProcess (data, preprocessConfig) {
  return data
}
