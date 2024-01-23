import { getPathData } from './svg.render.js'
import { getDefaultColors } from '../utils/css-colors.util.js'

/**
 *
 * @param {object} opts - function parameters
 * @param {CanvasRenderingContext2D} opts.context - canvas rendering context
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {import('../utils/css-colors.util.js').QRCodeCssColors} [opts.colors] - qr code colors
 */
export function renderTo2dContext ({ context, margin, cellSize = 2, qrcode, colors = getDefaultColors() }) {
  margin ??= cellSize * 4

  context.save()
  const pathData = getPathData({ cellSize, margin, qrcode })
  context.fillStyle = colors.lightColor
  context.fill(new Path2D(pathData.bg))
  context.fillStyle = colors.darkColor
  context.fill(new Path2D(pathData.dots))
  context.fillStyle = colors.cornerBorderColor
  context.fill(new Path2D(pathData.finderCorner))
  context.fillStyle = colors.cornerCenterColor
  context.fill(new Path2D(pathData.finderCenter))

  context.restore()
}
