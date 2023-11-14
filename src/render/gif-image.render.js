import { ByteArrayOutputStream } from '../utils/bite-array-output-stream'

// ---------------------------------------------------------------------
// gifImage (B/W)
// ---------------------------------------------------------------------

/**
 *
 * @param {number} width - image width
 * @param {number} height - image height
 * @returns
 */
// eslint-disable-next-line max-lines-per-function
export function gifImage (width, height) {
  const _width = width
  const _height = height
  const _data = new Array(width * height).fill(1)

  const _this = {}

  /**
   * @param {number} x - image horizontal position
   * @param {number} y - image vertical position
   * @param {number} pixel - pixel color
   */
  _this.setPixel = function (x, y, pixel) {
    _data[y * _width + x] = pixel
  }

  /**
   *
   * @param {import('../utils/bite-array-output-stream').ByteArrayOutputStream} out
   */
  _this.write = function (out) {
    // ---------------------------------
    // GIF Signature

    out.writeString('GIF87a')

    // ---------------------------------
    // Screen Descriptor

    out.writeShort(_width)
    out.writeShort(_height)

    out.writeByte(0x80) // 2bit
    out.writeByte(0)
    out.writeByte(0)

    // ---------------------------------
    // Global Color Map

    // black
    out.writeByte(0x00)
    out.writeByte(0x00)
    out.writeByte(0x00)

    // white
    out.writeByte(0xff)
    out.writeByte(0xff)
    out.writeByte(0xff)

    // ---------------------------------
    // Image Descriptor

    out.writeString(',')
    out.writeShort(0)
    out.writeShort(0)
    out.writeShort(_width)
    out.writeShort(_height)
    out.writeByte(0)

    // ---------------------------------
    // Local Color Map

    // ---------------------------------
    // Raster Data

    const lzwMinCodeSize = 2
    const raster = getLZWRaster(lzwMinCodeSize)

    out.writeByte(lzwMinCodeSize)

    let offset = 0

    while (raster.length - offset > 255) {
      out.writeByte(255)
      out.writeBytes(raster, offset, 255)
      offset += 255
    }

    out.writeByte(raster.length - offset)
    out.writeBytes(raster, offset, raster.length - offset)
    out.writeByte(0x00)

    // ---------------------------------
    // GIF Terminator
    out.writeString(';')
  }

  /**
   *
   * @param {import('../utils/bite-array-output-stream').ByteArrayOutputStream} out
   */
  const bitOutputStream = function (out) {
    const _out = out
    let _bitLength = 0
    let _bitBuffer = 0

    const _this = {}

    /**
     *
     * @param {number} data
     * @param {number} length
     */
    _this.write = function (data, length) {
      if ((data >>> length) !== 0) {
        throw Error('length over')
      }

      while (_bitLength + length >= 8) {
        _out.writeByte(0xff & ((data << _bitLength) | _bitBuffer))
        length -= (8 - _bitLength)
        data >>>= (8 - _bitLength)
        _bitBuffer = 0
        _bitLength = 0
      }

      _bitBuffer = (data << _bitLength) | _bitBuffer
      _bitLength = _bitLength + length
    }

    _this.flush = function () {
      if (_bitLength > 0) {
        _out.writeByte(_bitBuffer)
      }
    }

    return _this
  }

  /**
   *
   * @param {number} lzwMinCodeSize
   * @returns
   */
  function getLZWRaster (lzwMinCodeSize) {
    const clearCode = 1 << lzwMinCodeSize
    const endCode = (1 << lzwMinCodeSize) + 1
    let bitLength = lzwMinCodeSize + 1

    // Setup LZWTable
    const table = lzwTable()

    for (let i = 0; i < clearCode; i += 1) {
      table.add(String.fromCharCode(i))
    }
    table.add(String.fromCharCode(clearCode))
    table.add(String.fromCharCode(endCode))

    const byteOut = new ByteArrayOutputStream()
    const bitOut = bitOutputStream(byteOut)

    // clear code
    bitOut.write(clearCode, bitLength)

    let dataIndex = 0

    let s = String.fromCharCode(_data[dataIndex])
    dataIndex += 1

    while (dataIndex < _data.length) {
      const c = String.fromCharCode(_data[dataIndex])
      dataIndex += 1

      if (table.contains(s + c)) {
        s = s + c
      } else {
        bitOut.write(table.indexOf(s), bitLength)

        if (table.size < 0xfff) {
          if (table.size === (1 << bitLength)) {
            bitLength += 1
          }

          table.add(s + c)
        }

        s = c
      }
    }

    bitOut.write(table.indexOf(s), bitLength)

    // end code
    bitOut.write(endCode, bitLength)

    bitOut.flush()

    return byteOut.toByteArray()
  }

  return _this
};

/**
 * @returns {LzwTable} created LZW table
 */
function lzwTable () {
  /** @type {Record<string,number>} */
  const _map = {}
  let _size = 0

  const _this = /**  @type {LzwTable} */ ({
    add: (key) => {
      if (_this.contains(key)) {
        throw Error(`dup key: ${key}`)
      }
      _map[key] = _size
      _size += 1
    },
    get size () { return _size },
    indexOf: (key) => _map[key],
    contains:  (key) => typeof _map[key] !== 'undefined',
  })

  return _this
}

/**
 * @typedef {object} LzwTable
 * @property {(key: string) => void} add - add key to table
 * @property {number} size - table size
 * @property {(key: string) => number} indexOf - get index of key
 * @property {(key: string) => boolean} contains - check if key is already in table
 */
