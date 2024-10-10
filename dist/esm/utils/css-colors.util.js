/** @type {WeakRef<HTMLElement>} */
let tempDiv

/**
 *
 */
function getTempDiv () {
  const elem = tempDiv?.deref()
  if (elem) { return elem }
  const newElem = document.createElement('div')
  tempDiv = new WeakRef(newElem)
  return newElem
}

/**
 *
 * @param {string} color - color to check
 * @param {string} fallback - fallback color if `color` is invalid
 */
function getCssColorOrElse (color, fallback) {
  const ele = getTempDiv()
  ele.style.color = color
  const result = ele.style.color.replace(/\s+/, '').toLowerCase()
  ele.style.color = ''
  return result || fallback
}

/**
 * @returns {QRCodeCssColors} default CSS colors
 */
export function getDefaultColors () {
  return {
    darkColor: 'black',
    lightColor: 'white',
    cornerBorderColor: 'black',
    cornerCenterColor: 'black',
  }
}

/**
 *
 * @param {string} colorsVar - value of '--qrcode-color' property
 * @param {QRCodeCssColors} defaultColors - current default colors
 * @returns {QRCodeCssColors} updated colors
 */
function parseQrcodeColorProp (colorsVar, defaultColors) {
  const currentColors = { ...defaultColors }
  if (colorsVar) {
    const colorsList = colorsVar.split(/\s+/)
    const length = colorsList.length
    if (length >= 1) {
      currentColors.darkColor = getCssColorOrElse(colorsList[0], currentColors.darkColor)
    }
    if (length >= 2) {
      currentColors.lightColor = getCssColorOrElse(colorsList[1], currentColors.lightColor)
    }
    if (length >= 3) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[2], currentColors.cornerBorderColor)
    }
    if (length >= 4) {
      currentColors.cornerCenterColor = getCssColorOrElse(colorsList[3], currentColors.cornerCenterColor)
    }
  }
  return currentColors
}

/**
 *
 * @param {string} colorsVar - value of '--qrcode-corner-color' property
 * @param {QRCodeCssColors} defaultColors - current default colors
 * @returns {QRCodeCssColors} updated colors
 */
function parseQrcodeCornerColorProp (colorsVar, defaultColors) {
  const currentColors = { ...defaultColors }
  if (colorsVar) {
    const colorsList = colorsVar.split(/\s+/)
    if (colorsList.length === 1) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[0], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = currentColors.cornerBorderColor
    }
    if (colorsList.length >= 2) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[0], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = getCssColorOrElse(colorsList[1], currentColors.cornerCenterColor)
    }
  }
  return currentColors
}

/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeColorProperties} cssColors to draw the QRCode
 */
function QRCodeColorProperties (element) {
  const computedStyle = getComputedStyle(element)
  const propertyOf = (/** @type {string} */ prop) => computedStyle.getPropertyValue(prop).trim()

  return {
    color: propertyOf('--qrcode-color'),
    darkColor: propertyOf('--qrcode-dark-color'),
    lightColor: propertyOf('--qrcode-light-color'),
    cornerColor: propertyOf('--qrcode-corner-color'),
    cornerBorderColor: propertyOf('--qrcode-corner-border-color'),
    cornerCenterColor: propertyOf('--qrcode-corner-center-color'),
  }
}

/**
 * @param {QRCodeColorProperties} colorProperties - color properties
 * @returns {QRCodeCssColors} cssColors to draw the QRCode
 */
export function parseQrCodeColors (colorProperties) {
  let currentColors = {
    ...getDefaultColors(),
    cornerBorderColor: '',
    cornerCenterColor: '',
  }
  currentColors = parseQrcodeColorProp(colorProperties.color, currentColors)
  currentColors.darkColor = getCssColorOrElse(colorProperties.darkColor, currentColors.darkColor)
  currentColors.lightColor = getCssColorOrElse(colorProperties.lightColor, currentColors.lightColor)
  currentColors = parseQrcodeCornerColorProp(colorProperties.cornerColor, currentColors)
  currentColors.cornerBorderColor = getCssColorOrElse(colorProperties.cornerBorderColor, currentColors.cornerBorderColor) || currentColors.darkColor
  currentColors.cornerCenterColor = getCssColorOrElse(colorProperties.cornerCenterColor, currentColors.cornerCenterColor) || currentColors.cornerBorderColor
  return currentColors
}

/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeCssColors} cssColors to draw the QRCode
 */
export function parseQrCodeColorsFromElement (element) {
  return parseQrCodeColors(QRCodeColorProperties(element))
}

/**
 * @typedef {object} QRCodeCssColors
 * @property {string} darkColor - color to paint the black spots of the QR Code
 * @property {string} lightColor - color to paint the white spots of the QR Code
 * @property {string} cornerBorderColor - color of the position probe pattern border
 * @property {string} cornerCenterColor - color of the position probe pattern center
 */

/**
 * @typedef {object} QRCodeColorProperties
 * @property {string} color - `--qrcode-color` property value
 * @property {string} darkColor - `--qrcode-dark-color` property value
 * @property {string} lightColor - `--qrcode-light-color` property value
 * @property {string} cornerColor - `--qrcode-corner-color` property value
 * @property {string} cornerBorderColor - `--qrcode-corner-border-color` property value
 * @property {string} cornerCenterColor - `--qrcode-corner-center-color` property value
 */
