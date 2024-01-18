/** @type {WeakRef<HTMLElement>} */
let tempDiv

/**
 *
 */
function getTempDiv () {
  let ele
  if (!tempDiv) {
    ele = document.createElement('div')
    tempDiv = new WeakRef(ele)
  }
  ele = tempDiv.deref()
  if (!ele) {
    ele = document.createElement('div')
    tempDiv = new WeakRef(ele)
  }
  return ele
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
export function parseQrcodeColorProp (colorsVar, defaultColors) {
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
    if (length === 3) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[2], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = currentColors.cornerBorderColor
    }
    if (length >= 4) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[2], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = getCssColorOrElse(colorsList[3], currentColors.cornerCenterColor)
    }
    if (length === 1 || length === 2) {
      currentColors.cornerBorderColor = currentColors.darkColor
      currentColors.cornerCenterColor = currentColors.darkColor
    }
  }
  return currentColors
}

/**
 * @param {HTMLElement} element - target element
 * @returns {QRCodeCssColors} cssColors to draw the QRCode
 */
export function parseQrCodeColorsFromElement (element) {
  const computedStyle = getComputedStyle(element)

  let currentColors = getDefaultColors()
  currentColors = parseQrcodeColorProp(computedStyle.getPropertyValue('--qrcode-color')?.trim(), currentColors)
  currentColors.darkColor = getCssColorOrElse(computedStyle.getPropertyValue('--qrcode-dark-color')?.trim(), currentColors.darkColor)
  currentColors.lightColor = getCssColorOrElse(computedStyle.getPropertyValue('--qrcode-light-color')?.trim(), currentColors.lightColor)
  const cornerColorsVar = computedStyle.getPropertyValue('--qrcode-corner-color')?.trim()
  if (cornerColorsVar) {
    const colorsList = cornerColorsVar.split(/\s+/)
    if (colorsList.length === 1) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[0], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = currentColors.cornerBorderColor
    }
    if (colorsList.length >= 2) {
      currentColors.cornerBorderColor = getCssColorOrElse(colorsList[0], currentColors.cornerBorderColor)
      currentColors.cornerCenterColor = getCssColorOrElse(colorsList[1], currentColors.cornerCenterColor)
    }
  }

  currentColors.darkColor = getCssColorOrElse(computedStyle.getPropertyValue('--qrcode-corner-border-color')?.trim(), currentColors.darkColor)
  currentColors.lightColor = getCssColorOrElse(computedStyle.getPropertyValue('--qrcode-corner-center-color')?.trim(), currentColors.lightColor)

  return currentColors
}

/**
 * @typedef {object} QRCodeCssColors
 * @property {string} darkColor - color to paint the black spots of the QR Code
 * @property {string} lightColor - color to paint the white spots of the QR Code
 * @property {string} cornerBorderColor - color of the position probe pattern border
 * @property {string} cornerCenterColor - color of the position probe pattern center
 */
