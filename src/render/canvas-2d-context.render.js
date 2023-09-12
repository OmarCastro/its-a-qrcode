/**
 * 
 * @param {object} opts 
 * @param {CanvasRenderingContext2D} opts.context 
 * @param {number} [opts.cellSize]
 * @param {import('../qr-code.js').QrCode} opts.qrcode 
 */
export function renderTo2dContext({context, cellSize = 2, qrcode}) {
    var length = qrcode.moduleCount;
    for (var row = 0; row < length; row++) {
      for (var col = 0; col < length; col++) {
        context.fillStyle = qrcode.isDark(row, col) ? 'black' : 'white';
        context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
      }
    }
  }
