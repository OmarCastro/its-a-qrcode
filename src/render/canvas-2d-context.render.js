/**
 *
 * @param {object} opts - function parameters
 * @param {CanvasRenderingContext2D} opts.context - canvas rendering context
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @param {string} [opts.darkColor] - dark color of QRCode image defaults to black
 * @param {string} [opts.lightColor] - bright color of QRCode image defaults to white
 */
export function renderTo2dContext ({ context, cellSize = 2, qrcode, darkColor = 'black', lightColor = 'white' }) {
  const length = qrcode.moduleCount
  for (let row = 0; row < length; row++) {
    const ypos = row * cellSize
    for (let col = 0; col < length; col++) {
      context.fillStyle = qrcode.isDark(row, col) ? darkColor : lightColor
      const xpos = col * cellSize
      context.fillRect(xpos, ypos, cellSize, cellSize)
    }
  }
}
