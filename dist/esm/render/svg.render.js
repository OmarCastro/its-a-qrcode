import { escapeXml } from '../utils/escape-xml.util.js'
import { getDefaultColors } from '../utils/css-colors.util.js'
import { getDefaultStyles, DOT_STYLE, ROUNDED_STYLE, DEFAULT_STYLE } from '../utils/css-qrcode-style.util.js'

/**
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {string|SvgProp} [opts.alt] - image description
 * @param {string|SvgProp} [opts.title] - image title
 * @param {boolean} [opts.scalable] - flag to make the svg scalable
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-colors.util.js').QRCodeCssColors} [opts.colors] - qr code colors
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} [opts.style] - qr code colors
 * @returns {string} &lt;svg> element outer HTML
 */
export function createSvgTag ({ cellSize, margin, alt, title, qrcode, scalable, colors = getDefaultColors(), style }) {
  const { moduleCount } = qrcode

  cellSize ||= 2
  margin ??= cellSize * 4

  const titleProp = normalizeTitle(title)
  const altProp = normalizeAlt(alt)

  const paintSize = moduleCount * cellSize
  const size = paintSize + margin * 2

  const pathData = getPathData({ cellSize, margin, qrcode, style })

  let qrSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"'
  qrSvg += !scalable ? ' width="' + size + 'px" height="' + size + 'px"' : ''
  qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMinYMin meet"'
  qrSvg += a11yAttributes(titleProp, altProp) + '>'
  qrSvg += (titleProp.text) ? '<title id="' + escapeXml(titleProp.id) + '">' + escapeXml(titleProp.text) + '</title>' : ''
  qrSvg += (altProp.text) ? '<description id="' + escapeXml(altProp.id) + '">' + escapeXml(altProp.text) + '</description>' : ''
  qrSvg += '<g stroke="none">'
  qrSvg += `<path d="${pathData.bg}" fill-rule="evenodd" fill="${colors.lightColor}"/>`
  qrSvg += `<path d="${pathData.dots}" fill="${colors.darkColor}"/>`
  qrSvg += `<path d="${pathData.finderCorner}" fill="${colors.cornerBorderColor}"/>`
  qrSvg += `<path d="${pathData.finderCenter}" fill="${colors.cornerCenterColor}"/>`
  qrSvg += '</g></svg>'

  return qrSvg
};

/**
 * @param {object} opts - function parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} [opts.style] - qr code colors
 * @returns {PathData} path info to draw the QR Code
 */
export function getPathData ({ cellSize, margin, qrcode, style = getDefaultStyles() }) {
  const dots = dotPathData({ cellSize, margin, qrcode, style })
  const finderCorner = finderCornerPathData({ cellSize, margin, qrcode, style })
  const finderCenter = finderCenterPathData({ cellSize, margin, qrcode, style })
  const { moduleCount } = qrcode
  const size = moduleCount * cellSize + margin * 2
  const bg = `M0,0h${size}v${size}h-${size}z` + dots + finderCorner + finderCenter
  return { dots, finderCenter, finderCorner, bg }
}

/**
 * @param {object} opts - function parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} opts.style - qr code colors
 * @returns {string} &lt;path> `d` attribute value
 */
function dotPathData ({ cellSize, margin, qrcode, style }) {
  const { moduleCount } = qrcode

  let d = ''

  const drawRects = /** @type {const} */ ([
    [8, 0, moduleCount - 8, 8],
    [0, 8, 8, moduleCount - 8],
    [8, 8, moduleCount, moduleCount],
  ])
  for (const rect of drawRects) {
    d += renderQrCodeDotArea({ cellSize, margin, qrcode, style, rect })
  }

  return d
}

/**
 * @param {object} opts - function parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} opts.style - qr code colors
 * @param {Readonly<[number, number,number,number]>} opts.rect - qr code colors area to render, values are [minCol, minRow, maxCol, maxRow]
 * @returns {string} &lt;path> `d` attribute value
 */
function renderQrCodeDotArea ({ cellSize, margin, qrcode, style, rect }) {
  let d = ''

  let render = dotRenders.square
  if (style.dots === DOT_STYLE) {
    render = dotRenders.dot
  }
  if (style.dots === ROUNDED_STYLE) {
    render = dotRenders.rounded
  }

  const [minCol, minRow, maxCol, maxRow] = rect
  for (let row = minRow; row < maxRow; row += 1) {
    const mr = row * cellSize + margin
    for (let col = minCol; col < maxCol; col += 1) {
      const mc = col * cellSize + margin
      d += render(mc, mr, cellSize, qrcode, row, col)
    }
  }

  return d
}

/** @type {{[name: string]: DotPathRender}} */
const dotRenders = {
  square: (x, y, cellSize, qrcode, row, col) => qrcode.isDark(row, col) ? `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z` : '',
  dot (x, y, cellSize, qrcode, row, col) {
    if (!qrcode.isDark(row, col)) {
      return ''
    }
    const r = cellSize / 2
    return circlePath(x + r, y + r, r, 0)
  },
  rounded (x, y, cellSize, qrcode, row, col) {
    const { moduleCount } = qrcode
    if (!qrcode.isDark(row, col)) {
      return ''
    }
    const isTopDark = row > 0 && qrcode.isDark(row - 1, col)
    const isLeftDark = col > 0 && qrcode.isDark(row, col - 1)
    const isBottomDark = row < moduleCount - 1 && qrcode.isDark(row + 1, col)
    const isRightDark = col < moduleCount - 1 && qrcode.isDark(row, col + 1)
    const half = cellSize / 2

    if (!isTopDark && !isLeftDark && !isBottomDark && !isRightDark) {
      return circlePath(x + half, y + half, half, 0)
    }

    return `M${x + half},${y}` +
    (isTopDark || isRightDark ? `h${half}v${half}` : `a${half},${half} 0 0,1 ${half},${half}`) +
    (isRightDark || isBottomDark ? `v${half}h-${half}` : `a${half},${half} 0 0,1 -${half},${half}`) +
    (isBottomDark || isLeftDark ? `h-${half}v-${half}` : `a${half},${half} 0 0,1 -${half},-${half}`) +
    (isLeftDark || isTopDark ? `v-${half}h${half}` : `a${half},${half} 0 0,1 ${half},-${half}`) +
    'z'
  },

}

/**
 * @param {object} opts - function parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} opts.style - QR code style
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCornerPathData ({ cellSize, margin, qrcode, style }) {
  const { moduleCount } = qrcode
  return finderCornerPath(cellSize, 0, 0, margin, qrcode, style) +
    finderCornerPath(cellSize, moduleCount - 7, 0, margin, qrcode, style) +
    finderCornerPath(cellSize, 0, moduleCount - 7, margin, qrcode, style)
}

/**
 * @param {number} cellSize - cell size in pixels
 * @param {number} x - qr code column position of finder path
 * @param {number} y - qr code row position of finder path
 * @param {number} margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} style - QR code style
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCornerPath (cellSize, x, y, margin, qrcode, style) {
  const rx = x * cellSize + margin
  const ry = y * cellSize + margin
  const rectLength = 7 * cellSize
  const innerRecLength = 5 * cellSize
  if (style.cornerBorder === DOT_STYLE) {
    const radius = rectLength / 2
    const cx = rx + radius
    const cy = ry + radius
    const innerRadius = innerRecLength / 2
    return circlePath(cx, cy, radius, 0) + circlePath(cx, cy, innerRadius, 1)
  }
  if (style.cornerBorder === ROUNDED_STYLE) {
    const outerR = 2.5 * cellSize
    const lenBeforeArc = rectLength - 2 * outerR
    const outerRect = `M${rx + outerR},${ry}h${lenBeforeArc}a${outerR},${outerR} 0 0,1 ${outerR},${outerR}v${lenBeforeArc}a${outerR},${outerR} 0 0,1 -${outerR},${outerR}h${-lenBeforeArc}a${outerR},${outerR} 0 0,1 -${outerR},-${outerR}v${-lenBeforeArc}a${outerR},${outerR} 0 0,1 ${outerR},-${outerR}z`
    const innerR = 1.5 * cellSize
    const innerLenBeforeArc = rectLength - 2 * outerR
    const innerRect = `M${rx + outerR + innerLenBeforeArc},${ry + cellSize}h-${innerLenBeforeArc}a${innerR},${innerR} 0 0,0 -${innerR},${innerR}v${innerLenBeforeArc}a${innerR},${innerR} 0 0,0 ${innerR},${innerR}h${innerLenBeforeArc}a${innerR},${innerR} 0 0,0 ${innerR},-${innerR}v${-innerLenBeforeArc}a${innerR},${innerR} 0 0,0 -${innerR},-${innerR}z`
    return outerRect + innerRect
  }
  if (style.cornerBorder === DEFAULT_STYLE && style.dots !== DEFAULT_STYLE) {
    const drawRects = /** @type {const} */ ([
      [x, y, x + 7, y + 1],
      [x, y + 6, x + 7, y + 7],
      [x, y + 1, x + 1, y + 6],
      [x + 6, y + 1, x + 7, y + 6],
    ])
    return drawRects.map(rect => renderQrCodeDotArea({ cellSize, margin, qrcode, style, rect })).join('')
  }
  return `M${rx},${ry}h${rectLength}v${rectLength}h-${rectLength}zM${rx + cellSize},${ry + cellSize}v${innerRecLength}h${innerRecLength}v-${innerRecLength}z`
}

/**
 * @param {object} opts - function parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} opts.style - qr code colors
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCenterPathData ({ cellSize, margin, qrcode, style }) {
  const { moduleCount } = qrcode
  return finderCenterPath(cellSize, 2, 2, margin, qrcode, style) +
  finderCenterPath(cellSize, moduleCount - 5, 2, margin, qrcode, style) +
  finderCenterPath(cellSize, 2, moduleCount - 5, margin, qrcode, style)
}

/**
 * @param {number} cellSize - cell size in pixels
 * @param {number} x - qr code column position of finder path
 * @param {number} y - qr code row position of finder path
 * @param {number} margin - margin in pixels
 *  @param {import('../qr-code.js').QrCode} qrcode - QR Code data
 *  @param {import('../utils/css-qrcode-style.util.js').QRCodeCssStyles} style - QR code style
 * @returns {string} &lt;path> `d` attribute value
 */
function finderCenterPath (cellSize, x, y, margin, qrcode, style) {
  const rx = x * cellSize + margin
  const ry = y * cellSize + margin
  const rectLength = 3 * cellSize
  if (style.cornerCenter === DOT_STYLE) {
    const radius = rectLength / 2
    const cx = rx + radius
    const cy = ry + radius
    return circlePath(cx, cy, radius, 0)
  }
  if (style.cornerCenter === ROUNDED_STYLE) {
    const arcR = cellSize
    const lenBeforeArc = rectLength - 2 * arcR
    return `M${rx + arcR},${ry}h${lenBeforeArc}a${arcR},${arcR} 0 0,1 ${arcR},${arcR}v${lenBeforeArc}a${arcR},${arcR} 0 0,1 -${arcR},${arcR}h${-lenBeforeArc}a${arcR},${arcR} 0 0,1 -${arcR},-${arcR}v${-lenBeforeArc}a${arcR},${arcR} 0 0,1 ${arcR},-${arcR}z`
  }

  if (style.cornerCenter === DEFAULT_STYLE && style.dots !== DEFAULT_STYLE) {
    return renderQrCodeDotArea({ cellSize, margin, qrcode, style, rect: [x, y, x + 3, y + 3] })
  }

  return `M${rx},${ry}h${rectLength}v${rectLength}h-${rectLength}z`
}

/**
 * @param {Required<SvgProp>} title - qr code title
 * @param {Required<SvgProp>} alt - qr code alt
 * @returns {string} accessibility attributes or empty string if empty `title` and `alt`
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
 * Create a circle svg path
 * @param {number} cx - horizontal position of the circle center point
 * @param {number} cy - vertical position of the circle center point
 * @param {number} r - circle radius
 * @param {0|1} d -  to invert direction
 * @returns {string} &lt;path> `d` attribute value
 */
function circlePath (cx, cy, r, d) {
  return `M${cx + r},${cy} a${r},${r} 0 1,${d} -${r * 2},0 a ${r},${r} 0 1,${d} ${r * 2},0z`
}

/**
 * @typedef {object} SvgProp
 * @property {string} text - attribute text
 * @property {string} [id] - title tag id
 */

/**
 * @typedef {object} PathData
 * @property {string} dots - dots path d value
 * @property {string} finderCenter - finder center path d value
 * @property {string} finderCorner - finder corner path d value
 * @property {string} bg - light colored part path d value
 */

/**
 * @callback DotPathRender
 * @param {number} x - top left x position of the square area to render
 * @param {number} y - top left y position of the square area to render
 * @param {number} cellSize - length of square area to render
 * @param {import('../qr-code.js').QrCode} qrcode - QR Code data
 * @param {number} row - QR Code dot row position to draw
 * @param {number} col - QR Code dot column position to draw
 */
