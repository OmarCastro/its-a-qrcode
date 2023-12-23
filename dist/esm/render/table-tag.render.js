/**
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 2
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 4
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} &lt;table> element outer HTML
 */
export function createTableTag ({ cellSize, margin, qrcode }) {
  const { moduleCount } = qrcode

  cellSize ||= 2
  margin ??= cellSize * 4

  let qrHtml = ''

  qrHtml += '<table style="'
  qrHtml += ' border-width: 0px; border-style: none;'
  qrHtml += ' border-collapse: collapse;'
  qrHtml += ' padding: 0px; margin: ' + margin + 'px;'
  qrHtml += '">'
  qrHtml += '<tbody>'

  for (let r = 0; r < moduleCount; r += 1) {
    qrHtml += '<tr>'

    for (let c = 0; c < moduleCount; c += 1) {
      qrHtml += '<td style="'
      qrHtml += ' border-width: 0px; border-style: none;'
      qrHtml += ' border-collapse: collapse;'
      qrHtml += ' padding: 0px; margin: 0px;'
      qrHtml += ' width: ' + cellSize + 'px;'
      qrHtml += ' height: ' + cellSize + 'px;'
      qrHtml += ' background-color: '
      qrHtml += qrcode.isDark(r, c) ? '#000000' : '#ffffff'
      qrHtml += ';'
      qrHtml += '"/>'
    }

    qrHtml += '</tr>'
  }

  qrHtml += '</tbody>'
  qrHtml += '</table>'

  return qrHtml
};
