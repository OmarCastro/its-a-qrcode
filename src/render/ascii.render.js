/**
 *
 * @param {object} opts - function parameters
 * @param {number} [opts.cellSize] - cell size in pixels, defaults to 1
 * @param {number} [opts.margin] - margin in pixels, defaults to {@link cellSize} * 2
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} qr code in ASCII
 */
export function renderASCII ({ cellSize = 1, margin, qrcode }) {
  if (cellSize < 2) {
    return _createHalfASCII({ margin, qrcode })
  }

  cellSize -= 1
  margin ??= cellSize * 2

  const size = qrcode.moduleCount * cellSize + margin * 2
  const min = margin
  const max = size - margin

  let y, x, r, p

  const white = Array(cellSize + 1).join('██')
  const black = Array(cellSize + 1).join('  ')

  let ascii = ''
  let line = ''
  for (y = 0; y < size; y += 1) {
    r = Math.floor((y - min) / cellSize)
    line = ''
    for (x = 0; x < size; x += 1) {
      p = 1

      if (min <= x && x < max && min <= y && y < max && qrcode.isDark(r, Math.floor((x - min) / cellSize))) {
        p = 0
      }

      // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
      line += p ? white : black
    }

    for (r = 0; r < cellSize; r += 1) {
      ascii += line + '\n'
    }
  }

  return ascii.slice(0, -1)
}

/**
 *
 * @param {object} opts - function parameters
 * @param {number} [opts.margin] - margin in pixels, defaults to 2
 * @param {import('../qr-code.js').QrCode} opts.qrcode - QR Code data
 * @returns {string} qr code in ASCII
 */
function _createHalfASCII ({ margin = 2, qrcode }) {
  const cellSize = 1

  const size = qrcode.moduleCount * cellSize + margin * 2
  const min = margin
  const max = size - margin

  /** @type {Record<string, string>} */
  const blocks = {
    '██': '█',
    '█ ': '▀',
    ' █': '▄',
    '  ': ' ',
  }

  /** @type {Record<string, string>} */
  const blocksLastLineNoMargin = {
    '██': '▀',
    '█ ': '▀',
    ' █': ' ',
    '  ': ' ',
  }

  /** @type {(x: number, y: number) => boolean} */
  const isDarkPoint = (x, y) => min <= x && x < max && min <= y && y < max && qrcode.isDark((y - min), (x - min))
  /** @type {(x: number, y: number) => '█'|' '} */
  const codePoint = (x, y) => isDarkPoint(x, y) ? ' ' : '█'

  let ascii = ''
  for (let y = 0; y < size; y += 2) {
    // used to output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
    const blockToUse = (margin < 1 && y + 1 >= max) ? blocksLastLineNoMargin : blocks
    for (let x = 0; x < size; x += 1) {
      const p = codePoint(x, y) + codePoint(x, y + 1)
      ascii += blockToUse[p]
    }
    ascii += '\n'
  }

  if (size % 2 && margin > 0) {
    return ascii.slice(0, -size - 1) + Array(size + 1).join('▀')
  }

  return ascii.slice(0, -1)
}
