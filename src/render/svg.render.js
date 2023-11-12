import { escapeXml } from '../utils/escape-xml.util.js'

/**
 *
 * @param {object} opts - funtion parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 2
 * @param {string|SvgAttr} [opts.alt] - alt text
 * @param {string|SvgAttr} [opts.title] - qr code title
 * @param {boolean} [opts.scalable] - flag to make the svg scalable
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;svg> element outer HTML
 */
export function createSvgTag ({ cellSize, margin, alt, title, qrcode, scalable }) {
  const { moduleCount } = qrcode

  cellSize = cellSize || 2
  margin = (typeof margin === 'undefined') ? cellSize * 4 : margin
  const altAttr = normalizeAlt(alt)
  const titleAttr = normalizeTitle(title)

  const size = moduleCount * cellSize + margin * 2
  const rect = 'l' + cellSize + ',0 0,' + cellSize + ' -' + cellSize + ',0 0,-' + cellSize + 'z '

  let qrSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"'
  qrSvg += !scalable ? ' width="' + size + 'px" height="' + size + 'px"' : ''
  qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" '
  qrSvg += ' preserveAspectRatio="xMinYMin meet"'
  qrSvg += a11yAttributes(titleAttr, altAttr) + '>'
  qrSvg += (titleAttr.text) ? '<title id="' + escapeXml(titleAttr.id) + '">' + escapeXml(titleAttr.text) + '</title>' : ''
  qrSvg += (altAttr.text) ? '<description id="' + escapeXml(altAttr.id) + '">' + escapeXml(altAttr.text) + '</description>' : ''
  qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>'
  qrSvg += '<path d="'

  for (let r = 0; r < moduleCount; r += 1) {
    const mr = r * cellSize + margin
    for (let c = 0; c < moduleCount; c += 1) {
      if (qrcode.isDark(r, c)) {
        const mc = c * cellSize + margin
        qrSvg += 'M' + mc + ',' + mr + rect
      }
    }
  }

  qrSvg += '" stroke="transparent" fill="black"/>'
  qrSvg += '</svg>'

  return qrSvg
};

/**
 * Compose alt property surrogate
 * @param {SvgAttr} title - qr code title
 * @param {SvgAttr} alt - qr code alt
 * @returns {string} acessibility attributes or empty string if empty `title` and `alt`
 */
const a11yAttributes = (title, alt) => (title.text || alt.text) ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(' ').trim()) + '"' : ''

/**
 * Compose alt property surrogate
 * @param {string|SvgAttr} [alt] - qr code alt
 * @returns {NormalizedSvgAttr} normalized Title
 */
const normalizeAlt = (alt) => {
  const result = (typeof alt === 'string') ? { text: alt, id: '' } : { text: '', id: '', ...alt }
  result.id = result.id || 'qrcode-description'
  return result
}

/**
 * Compose title property surrogate
 * @param {string|SvgAttr} [title] - qr code title
 * @returns {NormalizedSvgAttr} normalized Title
 */
const normalizeTitle = (title) => {
  const result = (typeof title === 'string') ? { text: title, id: '' } : { text: '', id: '', ...title }
  result.id = result.id || 'qrcode-title'
  return result
}

/**
 * @typedef {object} SvgAttr
 * @property {string} text
 * @property {string} [id]
 */

/**
 * @typedef {Required<SvgAttr>} NormalizedSvgAttr
 */

