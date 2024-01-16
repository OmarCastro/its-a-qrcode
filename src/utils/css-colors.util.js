/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeCssColors} cssColors to draw the QRCode
 */
export function parseQrCodeColorsFromElement (element) {
  const computedStyle = getComputedStyle(element)

  const darkColor = computedStyle.getPropertyValue('--qrcode-dark-color') || 'black'
  const lightColor = computedStyle.getPropertyValue('--qrcode-light-color') || 'white'
  const cornerBorderColor = computedStyle.getPropertyValue('--qrcode-corner-color') || 'black'
  const cornerCenterColor = computedStyle.getPropertyValue('--qrcode-corner-color') || 'black'

  return {
    darkColor,
    lightColor,
    cornerBorderColor,
    cornerCenterColor,
  }
}

/**
 * @typedef {object} QRCodeCssColors
 * @property {string} darkColor - color to paint the black spots of the QR Code
 * @property {string} lightColor - color to paint the white spots of the QR Code
 * @property {string} cornerBorderColor - color of the position probe pattern border
 * @property {string} cornerCenterColor - color of the position probe pattern center
 */
