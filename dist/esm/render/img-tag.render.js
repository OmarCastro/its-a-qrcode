import { createDataURL } from './data-url-canvas.render.js'
import { escapeXml } from '../utils/escape-xml.util.js'

/**
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {string} [opts.alt] - image description
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {string} [opts.darkColor] - dark color of QRCode image defaults to black
 * @param {string} [opts.lightColor] - bright color of QRCode image defaults to white
 * @returns {string} &lt;img> element outer HTML
 */
export function createImgTag ({ cellSize, margin, alt, qrcode, darkColor = 'black', lightColor = 'white' }) {
  cellSize ||= 2
  margin ??= cellSize * 4
  const size = qrcode.moduleCount * cellSize + margin * 2
  const altAttr = alt ? ` alt="${escapeXml(alt)}"` : ''
  return `<img src="${createDataURL({ cellSize, margin, qrcode, darkColor, lightColor })}" width="${size}" height="${size}"${altAttr}/>`
};
