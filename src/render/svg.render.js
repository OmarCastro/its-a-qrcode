import { escapeXml } from '../utils/escape-xml.util.js'
import { getDefaultColors } from '../utils/css-colors.util.js'

/**
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {string|SvgProp} [opts.alt] - image description
 * @param {string|SvgProp} [opts.title] - image title
 * @param {boolean} [opts.scalable] - flag to make the svg scalable
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-colors.util.js').QRCodeCssColors} [opts.colors] - qr code colors
 * @returns {string} &lt;svg> element outer HTML
 */
export function createSvgTag ({ cellSize, margin, alt, title, qrcode, scalable, colors = getDefaultColors() }) {
  const { moduleCount } = qrcode

  cellSize ||= 2
  margin ??= cellSize * 4

  const titleProp = normalizeTitle(title)
  const altProp = normalizeAlt(alt)

  const paintSize = moduleCount * cellSize
  const size = paintSize + margin * 2

  let qrSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"'
  qrSvg += !scalable ? ' width="' + size + 'px" height="' + size + 'px"' : ''
  qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMinYMin meet"'
  qrSvg += ' shape-rendering="crispEdges"' // disables anti-aliasing, without it, a line between the QR Code paint area and the margin will appear
  qrSvg += a11yAttributes(titleProp, altProp) + '>'
  qrSvg += (titleProp.text) ? '<title id="' + escapeXml(titleProp.id) + '">' + escapeXml(titleProp.text) + '</title>' : ''
  qrSvg += (altProp.text) ? '<description id="' + escapeXml(altProp.id) + '">' + escapeXml(altProp.text) + '</description>' : ''
  qrSvg += `<g stroke="none" fill="${colors.lightColor}">`
  qrSvg += `<path d="M0,0h${size}v${size}h-${size}zM${margin},${margin}v${paintSize}h${paintSize}v-${paintSize}z"/>`
  qrSvg += `<path d="${whitePathData({ cellSize, margin, qrcode })}" fill-rule="evenodd"/>`
  qrSvg += `<path d="${dotPathData({ cellSize, margin, qrcode })}" fill="${colors.darkColor}"/>`
  qrSvg += `<path d="${finderCornerPathData({ cellSize, margin, qrcode })}" fill="${colors.cornerBorderColor}"/>`
  qrSvg += `<path d="${finderCenterPathData({ cellSize, margin, qrcode })}" fill="${colors.cornerCenterColor}"/>`
  qrSvg += '</g></svg>'

  return qrSvg
};

/**
 * @param {object} opts - funtion parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;path> `d` attribute value
 */
function whitePathData ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode
  const paintSize = moduleCount * cellSize

  const d = `M${margin},${margin}h${paintSize}v${paintSize}h-${paintSize}z`
  return d +
    dotPathData({ cellSize, margin, qrcode }) +
    finderCornerPathData({ cellSize, margin, qrcode }) +
    finderCenterPathData({ cellSize, margin, qrcode })
}

/**
 * @param {object} opts - funtion parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;path> `d` attribute value
 */
function dotPathData ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode

  let d = ''
  const rect = `h${cellSize}v${cellSize}h-${cellSize}z`
  const drawRects = [
    [8, 0, moduleCount - 8, 8],
    [0, 8, 8, moduleCount - 8],
    [8, 8, moduleCount, moduleCount],
  ]
  for (const [minCol, minRow, maxCol, maxRow] of drawRects) {
    for (let row = minRow; row < maxRow; row += 1) {
      const mr = row * cellSize + margin
      for (let col = minCol; col < maxCol; col += 1) {
        if (qrcode.isDark(row, col)) {
          const mc = col * cellSize + margin
          d += `M${mc},${mr}${rect}`
        }
      }
    }
  }

  return d
}

/**
 * @param {object} opts - funtion parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCornerPathData ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode
  return finderCornerPath(cellSize, 0, 0, margin) +
    finderCornerPath(cellSize, moduleCount - 7, 0, margin) +
    finderCornerPath(cellSize, 0, moduleCount - 7, margin)
}

/**
 * @param {number} cellSize - cell size in pixels
 * @param {number} x - qr code column position of finder path
 * @param {number} y - qr code row position of finder path
 * @param {number} margin - margin in pixels
 * @returns  {string} &lt;path> `d` attribute value
 */
function finderCornerPath (cellSize, x, y, margin) {
  const rx = x * cellSize + margin
  const ry = y * cellSize + margin
  const rectLenght = 7 * cellSize
  const innerRecLength = 5 * cellSize
  return `M${rx},${ry}h${rectLenght}v${rectLenght}h-${rectLenght}zM${rx + cellSize},${ry + cellSize}v${innerRecLength}h${innerRecLength}v-${innerRecLength}z`
}

/**
 * @param {object} opts - funtion parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCenterPathData ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode
  return finderCenterPath(cellSize, 2, 2, margin) +
  finderCenterPath(cellSize, moduleCount - 5, 2, margin) +
  finderCenterPath(cellSize, 2, moduleCount - 5, margin)
}

/**
 * @param {number} cellSize - cell size in pixels
 * @param {number} x - qr code column position of finder path
 * @param {number} y - qr code row position of finder path
 * @param {number} margin - margin in pixels
 * @returns  {string} &lt;path> `d` attribute value
 */
function finderCenterPath (cellSize, x, y, margin) {
  const rx = x * cellSize + margin
  const ry = y * cellSize + margin
  const rectLenght = 3 * cellSize
  return `M${rx},${ry}h${rectLenght}v${rectLenght}h-${rectLenght}z`
}

/**
 * @param {Required<SvgProp>} title - qr code title
 * @param {Required<SvgProp>} alt - qr code alt
 * @returns {string} acessibility attributes or empty string if empty `title` and `alt`
 */
const a11yAttributes = (title, alt) => (title.text || alt.text) ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(' ').trim()) + '"' : ''

/**
 * @param {string|SvgProp} [alt] - qr code alt
 * @returns {Required<SvgProp>} Composed alt property surrogate
 */
const normalizeAlt = (alt) => {
  const result = (typeof alt === 'string') ? { text: alt, id: '' } : { text: '', id: '', ...alt }
  result.id = result.id || 'qrcode-description'
  return result
}

/**
 * Compose title property surrogate
 * @param {string|SvgProp} [title] - qr code title
 * @returns {Required<SvgProp>} Composed title property surrogate
 */
const normalizeTitle = (title) => {
  const result = (typeof title === 'string') ? { text: title, id: '' } : { text: '', id: '', ...title }
  result.id = result.id || 'qrcode-title'
  return result
}

/**
 * @typedef {object} SvgProp
 * @property {string} text - attribute text
 * @property {string} [id] - title tag id
 */
