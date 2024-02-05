export const DEFAULT_STYLE = 'default'
export const ROUNDED_STYLE = 'rounded'
export const SQUARE_STYLE = 'square'
export const DOT_STYLE = 'dot'

const validStyles = /** @type {const} */([DEFAULT_STYLE, ROUNDED_STYLE, SQUARE_STYLE, DOT_STYLE])

/**
 * @param {string} style - style to apply
 * @param {QRCodeCssStyle} fallback - fallback color if `color` is invalid
 * @returns {QRCodeCssStyle} validStyle
 */
function getStyleOrElse (style, fallback) {
  if (typeof style !== 'string') {
    return fallback
  }
  const toLowerCaseStyle = /** @type {QRCodeCssStyle} */ (style.toLocaleLowerCase())
  const isValidStyle = validStyles.includes(toLowerCaseStyle)
  return isValidStyle ? toLowerCaseStyle : fallback
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
    const colorsList = colorsVar.trim().split(/\s+/)
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
 * @typedef {typeof validStyles[number]} QRCodeCssStyle
 */

/**
 * @typedef {object} QRCodeCssStyles
 * @property {QRCodeCssStyle} dots -  QR Code dots draw style
 * @property {QRCodeCssStyle} cornerBorder - QR Code position probe pattern border draw style
 * @property {QRCodeCssStyle} cornerCenter - QR Code position probe pattern center  draw style
 */

/**
 * @typedef {object} QRCodeStyleProperties
 * @property {string} style - `--qrcode-style` property value
 * @property {string} dotStyle - `--qrcode-dot-style` property value
 * @property {string} cornerBorderStyle - `--qrcode-corner-border-style` property value
 * @property {string} cornerCenterStyle - `--qrcode-corner-center-style` property value
 */
