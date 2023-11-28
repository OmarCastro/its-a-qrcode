import { renderTo2dContext } from './canvas-2d-context.render.js'

/**
 *
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {string} [opts.darkColor] - dark color of QRCode image defaults to black
 * @param {string} [opts.brightColor] - bright color of QRCode image defaults to white
 * @returns {string} data url of qr code image
 */
export function createDataURL ({ cellSize = 2, margin, qrcode, darkColor = 'black', brightColor = 'white' }) {
  margin ??= cellSize * 4

  const paintSize = qrcode.moduleCount * cellSize
  const size = paintSize + margin * 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    return ''
  }
  context.fillStyle = brightColor
  context.fillRect(0, 0, size, size)
  context.clearRect(margin, margin, paintSize, paintSize)
  context.translate(margin, margin)
  renderTo2dContext({ context, cellSize, qrcode, darkColor, brightColor })
  return canvas.toDataURL('image/png', 1.0)
};
