/**
 *
 * @param {number} cellSize
 * @param {number} margin
 * @param {import('../qr-code.js').QrCode} qrcode
 * @returns {string} &lt;table> element outer HTML
 */
export function createTableTag (cellSize, margin, qrcode) {
  const { moduleCount } = qrcode

  cellSize = cellSize || 2
  margin = (typeof margin === 'undefined') ? cellSize * 4 : margin

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
