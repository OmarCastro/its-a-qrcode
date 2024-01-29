export const DEFAULT_STYLE = 'default'
export const ROUNDED_STYLE = 'rounded'
export const DOT_STYLE = 'dot'

const validStyles = new Set([DEFAULT_STYLE, ROUNDED_STYLE, DOT_STYLE])

/**
 * @param {string} style - style to apply
 * @param {string} fallback - fallback color if `color` is invalid
 */
function getStyleOrElse (style, fallback) {
  const isValidStyle = validStyles.has(style.toLowerCase())
  return isValidStyle ? style : fallback
}

/**
 * @returns {QRCodeCssStyles} default CSS styles
 */
export function getDefaultStyles () {
  return {
    dots: DEFAULT_STYLE,
    cornerBorder: DEFAULT_STYLE,
    cornerCenter: DEFAULT_STYLE,
  }
}

/**
 *
 * @param {string} colorsVar - value of '--qrcode-color' property
 * @param {QRCodeCssStyles} defaultColors - current default colors
 * @returns {QRCodeCssStyles} updated colors
 */
function parseQrcodeStyleProp (colorsVar, defaultColors) {
  const currentStyles = { ...defaultColors }
  if (colorsVar) {
    const colorsList = colorsVar.split(/\s+/)
    const length = colorsList.length
    if (length >= 1) {
      currentStyles.dots = getStyleOrElse(colorsList[0], currentStyles.dots)
    }
    if (length >= 2) {
      currentStyles.cornerBorder = getStyleOrElse(colorsList[1], currentStyles.cornerBorder)
    }
    if (length >= 3) {
      currentStyles.cornerCenter = getStyleOrElse(colorsList[2], currentStyles.cornerCenter)
    }
  }
  return currentStyles
}

/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeStyleProperties} cssColors to draw the QRCode
 */
function QRCodeStyleProperties (element) {
  const computedStyle = getComputedStyle(element)
  const propertyOf = (/** @type {string} */ prop) => computedStyle.getPropertyValue(prop).trim()

  return {
    style: propertyOf('--qrcode-style'),
    dotStyle: propertyOf('--qrcode-dot-style'),
    cornerBorderStyle: propertyOf('--qrcode-corner-border-style'),
    cornerCenterStyle: propertyOf('--qrcode-corner-center-style'),
  }
}

/**
 * @param {QRCodeStyleProperties} styleProperties - color properties
 * @returns {QRCodeCssStyles} cssColors to draw the QRCode
 */
export function parseQrCodeStyles (styleProperties) {
  let currentStyles = getDefaultStyles()
  currentStyles = parseQrcodeStyleProp(styleProperties.style, currentStyles)
  currentStyles.dots = getStyleOrElse(styleProperties.dotStyle, currentStyles.dots)
  currentStyles.cornerBorder = getStyleOrElse(styleProperties.cornerBorderStyle, currentStyles.cornerBorder)
  currentStyles.cornerCenter = getStyleOrElse(styleProperties.cornerCenterStyle, currentStyles.cornerCenter)
  return currentStyles
}

/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeCssStyles} cssColors to draw the QRCode
 */
export function parseQrCodeStylesFromElement (element) {
  return parseQrCodeStyles(QRCodeStyleProperties(element))
}

/**
 * @typedef {object} QRCodeCssStyles
 * @property {string} dots -  QR Code dots draw style
 * @property {string} cornerBorder - QR Code position probe pattern border draw style
 * @property {string} cornerCenter - QR Code position probe pattern center  draw style
 */

/**
 * @typedef {object} QRCodeStyleProperties
 * @property {string} style - `--qrcode-style` property value
 * @property {string} dotStyle - `--qrcode-dot-style` property value
 * @property {string} cornerBorderStyle - `--qrcode-corner-border-style` property value
 * @property {string} cornerCenterStyle - `--qrcode-corner-center-style` property value
 */
