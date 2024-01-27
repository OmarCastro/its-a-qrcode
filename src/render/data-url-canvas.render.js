import { renderTo2dContext } from './canvas-2d-context.render.js'

/**
 *
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-colors.util.js').QRCodeCssColors} [opts.colors] - qr code colors
 * @param {import('../utils/css-qrcode-style.js').QRCodeCssStyles} [opts.style] - qr code colors
 * @returns {string} data url of qr code image
 */
export function createDataURL ({ cellSize = 2, margin, qrcode, colors, style }) {
  margin ??= cellSize * 4

  const paintSize = qrcode.moduleCount * cellSize
  const size = paintSize + margin * 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'))
  renderTo2dContext({ context, cellSize, margin, qrcode, colors, style })
  return canvas.toDataURL('image/png', 1.0)
};
