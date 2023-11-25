import { escapeXml } from '../utils/escape-xml.util.js'

/**
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {string|SvgProp} [opts.alt] - image description
 * @param {string|SvgProp} [opts.title] - image title
 * @param {boolean} [opts.scalable] - flag to make the svg scalable
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;svg> element outer HTML
 */
export function createSvgTag ({ cellSize, margin, alt, title, qrcode, scalable }) {
  const { moduleCount } = qrcode

  cellSize ||= 2
  margin ??= cellSize * 4

  const titleProp = normalizeTitle(title)
  const altProp = normalizeAlt(alt)

  const size = moduleCount * cellSize + margin * 2

  let qrSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"'
  qrSvg += !scalable ? ' width="' + size + 'px" height="' + size + 'px"' : ''
  qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMinYMin meet"'
  qrSvg += a11yAttributes(titleProp, altProp) + '>'
  qrSvg += (titleProp.text) ? '<title id="' + escapeXml(titleProp.id) + '">' + escapeXml(titleProp.text) + '</title>' : ''
  qrSvg += (altProp.text) ? '<description id="' + escapeXml(altProp.id) + '">' + escapeXml(altProp.text) + '</description>' : ''
  qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>'
  qrSvg += `<path d="${pathData({ cellSize, margin, qrcode })}" stroke="transparent" fill="black"/>`
  qrSvg += '</svg>'

  return qrSvg
};

/**
 * @param {object} opts - funtion parameters
 * @param {number} opts.cellSize - cell size in pixels
 * @param {number} opts.margin - margin in pixels
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;path> `d` attribute value
 */
function pathData ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode

  let d = ''
  const rect = 'l' + cellSize + ',0 0,' + cellSize + ' -' + cellSize + ',0 0,-' + cellSize + 'z '

  for (let r = 0; r < moduleCount; r += 1) {
    const mr = r * cellSize + margin
    for (let c = 0; c < moduleCount; c += 1) {
      if (qrcode.isDark(r, c)) {
        const mc = c * cellSize + margin
        d += 'M' + mc + ',' + mr + rect
      }
    }
  }
  return d
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
