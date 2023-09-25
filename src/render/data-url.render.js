import { gifImage } from './gif-image.render'
import { ByteArrayOutputStream } from '../utils/bite-array-output-stream.js'
import { bytesToBase64 } from '../utils/text-decode-encode.util.js'

/**
 *
 * @param {object} opts
 * @param {number} opts.cellSize
 * @param {number} opts.margin
 * @param {import('../qr-code.js').QrCode} opts.qrcode
 */
export function createDataURL ({ cellSize, margin, qrcode }) {
  cellSize = cellSize || 2
  margin = (typeof margin === 'undefined') ? cellSize * 4 : margin

  const size = qrcode.moduleCount * cellSize + margin * 2
  const min = margin
  const max = size - margin

  return createDataURLAux(size, size, function (x, y) {
    if (min <= x && x < max && min <= y && y < max) {
      const c = Math.floor((x - min) / cellSize)
      const r = Math.floor((y - min) / cellSize)
      return qrcode.isDark(r, c) ? 0 : 1
    } else {
      return 1
    }
  })
};

/**
 *
 * @param {number} width : ;
 * @param {number} height
 * @param {(x: number, y:number) => number} getPixel
 * @returns
 */
function createDataURLAux (width, height, getPixel) {
  const gif = gifImage(width, height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      gif.setPixel(x, y, getPixel(x, y))
    }
  }

  const b = new ByteArrayOutputStream()
  gif.write(b)
  const base64 = bytesToBase64(b.toByteArray())
  return 'data:image/gif;base64,' + base64
};
