import { getRSBlocks } from './utils/qr-rs-block.utils.js'
import { fromString } from './utils/qr-rs-correction-level.constants.js'
import { getLengthInBits, getPatternPosition, getBCHTypeInfo, getBCHTypeNumber, getMaskFunction } from './utils/qr-util.js'
import { createData } from './utils/create-data.util.js'
import { QrKanji } from './modes/kanji.mode.js'
import { Qr8BitByte } from './modes/byte.mode.js'
import { QrNumber } from './modes/number.mode.js'
import { QrAlphaNum } from './modes/alphanum.mode.js'
import { QrBitBuffer } from './utils/qr-bit-buffer.js'

export class QrCode {
  /** @type {number} */
  typeNumber = 0

  /** @type {number} */

  errorCorrectionLevel
  moduleCount
  modules
  /** @type {number[] | null} */
  #dataCache
  /** @type {ReturnType<QrKanji | Qr8BitByte | QrNumber | QrAlphaNum>[] } */
  dataList

  /**
   * @param {number} typeNumber
   * @param { "L" | 'M' | 'Q' | 'H'} errorCorrectionLevel
   */
  constructor (typeNumber, errorCorrectionLevel) {
    this.typeNumber = typeNumber
    this.errorCorrectionLevel = fromString(errorCorrectionLevel).bit
    this.moduleCount = 0
    this.modules = createModuleTable(this.moduleCount)
    this.#dataCache = null
    this.dataList = []
  }

  /**
   *
   * @param {boolean} test
   * @param {number} maskPattern
   */
  makeImpl (test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17

    const moduleCount = this.moduleCount
    this.modules = createModuleTable(moduleCount)

    this.setupPositionProbePattern(0, 0)
    this.setupPositionProbePattern(moduleCount - 7, 0)
    this.setupPositionProbePattern(0, moduleCount - 7)
    setupPositionAdjustPattern(this)
    this.setupTimingPattern()
    setupTypeInfo(test, maskPattern, this)

    if (this.typeNumber >= 7) {
      setupTypeNumber(test, this)
    }

    if (this.#dataCache == null) {
      this.#dataCache = createData(this.typeNumber, this.errorCorrectionLevel, this.dataList)
    }

    mapData(this.#dataCache, maskPattern, this)
  };

  /**
   *
   * @param {number} row
   * @param {number} col
   */
  setupPositionProbePattern (row, col) {
    const { modules, moduleCount } = this

    for (let r = -1; r <= 7; r += 1) {
      if (row + r <= -1 || moduleCount <= row + r) continue

      for (let c = -1; c <= 7; c += 1) {
        if (col + c <= -1 || moduleCount <= col + c) continue

        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          modules[row + r][col + c] = true
        } else {
          modules[row + r][col + c] = false
        }
      }
    }
  };

  setupTimingPattern () {
    const { modules, moduleCount } = this

    for (let r = 8; r < moduleCount - 8; r += 1) {
      if (modules[r][6] != null) {
        continue
      }
      modules[r][6] = (r % 2 === 0)
    }

    for (let c = 8; c < moduleCount - 8; c += 1) {
      if (modules[6][c] != null) {
        continue
      }
      modules[6][c] = (c % 2 === 0)
    }
  };

  /**
   *
   * @param {number} row
   * @param {number} col
   */
  isDark (row, col) {
    const { modules, moduleCount } = this

    if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
      throw Error(`out of bounds row: ${row}, column: ${col}, module count: ${moduleCount}`)
    }
    return modules[row][col]
  };

  /**
   *
   * @param {string} data
   * @param {'Byte'|'Numeric'|'Alphanumeric'|'Kanji'} mode
   */
  addData (data, mode) {
    mode = mode || 'Byte'

    switch (mode) {
      case 'Numeric' : this.dataList.push(QrNumber(data)); break
      case 'Alphanumeric' : this.dataList.push(QrAlphaNum(data)); break
      case 'Byte' : this.dataList.push(Qr8BitByte(data)); break
      case 'Kanji' : this.dataList.push(QrKanji(data)); break
      default : throw Error(`invalid mode "${mode}"`)
    }

    this.#dataCache = null
  };

  make () {
    if (this.typeNumber < 1) {
      this.typeNumber = getBestTypeNumber(this)
    }
    this.makeImpl(false, getBestMaskPattern(this))
  };
}

/**
 *
 * @param {QrCode} qrcode
 * @returns {number} type number
 */
function getBestTypeNumber (qrcode) {
  const { errorCorrectionLevel, dataList } = qrcode

  for (let typeNumber = 1; typeNumber < 40; typeNumber++) {
    const rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel)
    const buffer = new QrBitBuffer()

    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i]
      buffer.put(data.mode, 4)
      buffer.put(data.length, getLengthInBits(data.mode, typeNumber))
      data.write(buffer)
    }

    let totalDataCount = 0
    for (const rsBlock of rsBlocks) {
      totalDataCount += rsBlock.dataCount
    }

    if (buffer.bitLength <= totalDataCount * 8) {
      return typeNumber
    }
  }

  throw Error('data length too high to detect type number')
}

/**
 *
 * @param {number} moduleCount
 * @returns {boolean[][]}
 */
function createModuleTable (moduleCount) {
  const modules = new Array(moduleCount)
  for (let row = 0; row < moduleCount; row += 1) {
    modules[row] = new Array(moduleCount).fill(null)
  }
  return modules
}

/**
 *
 * @param {QrCode} qrcode
 * @returns {number}
 */
function getBestMaskPattern (qrcode) {
  let minLostPoint = 0
  let pattern = 1
  for (let i = 0; i < 8; i += 1) {
    qrcode.makeImpl(true, i)

    const lostPoint = getLostPoint(qrcode)

    if (i === 0 || minLostPoint > lostPoint) {
      minLostPoint = lostPoint
      pattern = i
    }
  }

  return pattern
}

/**
 *
 * @param {QrCode} qrcode
 */
function setupPositionAdjustPattern (qrcode) {
  const { modules } = qrcode

  const pos = getPatternPosition(qrcode.typeNumber)

  for (let i = 0; i < pos.length; i += 1) {
    for (let j = 0; j < pos.length; j += 1) {
      const row = pos[i]
      const col = pos[j]

      if (modules[row][col] != null) {
        continue
      }

      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
            modules[row + r][col + c] = true
          } else {
            modules[row + r][col + c] = false
          }
        }
      }
    }
  }
}

/**
 *
 * @param {boolean} test
 * @param {QrCode} qrcode
 */
function setupTypeNumber (test, qrcode) {
  const { typeNumber, modules, moduleCount } = qrcode

  const bits = getBCHTypeNumber(typeNumber)

  for (let i = 0; i < 18; i += 1) {
    const mod = (!test && ((bits >> i) & 1) === 1)
    modules[Math.floor(i / 3)][i % 3 + moduleCount - 8 - 3] = mod
  }

  for (let i = 0; i < 18; i += 1) {
    const mod = (!test && ((bits >> i) & 1) === 1)
    modules[i % 3 + moduleCount - 8 - 3][Math.floor(i / 3)] = mod
  }
}

/**
 *
 * @param {number[]} data
 * @param {number} maskPattern
 * @param {QrCode} qrcode
 */
function mapData (data, maskPattern, qrcode) {
  const { moduleCount, modules } = qrcode

  let inc = -1
  let row = moduleCount - 1
  let bitIndex = 7
  let byteIndex = 0
  const maskFunc = getMaskFunction(maskPattern)

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1

    while (true) {
      for (let c = 0; c < 2; c += 1) {
        if (modules[row][col - c] == null) {
          let dark = false

          if (byteIndex < data.length) {
            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1)
          }

          const mask = maskFunc(row, col - c)

          if (mask) {
            dark = !dark
          }

          modules[row][col - c] = dark
          bitIndex -= 1

          if (bitIndex === -1) {
            byteIndex += 1
            bitIndex = 7
          }
        }
      }

      row += inc

      if (row < 0 || moduleCount <= row) {
        row -= inc
        inc = -inc
        break
      }
    }
  }
}

/**
 *
 * @param {QrCode} qrcode
 */
export function getLostPoint (qrcode) {
  const { moduleCount, modules } = qrcode
  /**
   *
   * @param {number} r
   * @param {number} c
   * @returns
   */
  const isDark = (r, c) => modules[r][c]
  let lostPoint = 0

  // LEVEL1

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      let sameCount = 0
      const dark = isDark(row, col)

      for (let r = -1; r <= 1; r += 1) {
        if (row + r < 0 || moduleCount <= row + r) {
          continue
        }

        for (let c = -1; c <= 1; c += 1) {
          if (col + c < 0 || moduleCount <= col + c) {
            continue
          }

          if (r === 0 && c === 0) {
            continue
          }

          if (dark === isDark(row + r, col + c)) {
            sameCount += 1
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += (3 + sameCount - 5)
      }
    }
  };

  // LEVEL2

  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      let count = 0
      if (isDark(row, col)) count += 1
      if (isDark(row + 1, col)) count += 1
      if (isDark(row, col + 1)) count += 1
      if (isDark(row + 1, col + 1)) count += 1
      if (count === 0 || count === 4) {
        lostPoint += 3
      }
    }
  }

  // LEVEL3

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount - 6; col += 1) {
      if (isDark(row, col) &&
          !isDark(row, col + 1) &&
          isDark(row, col + 2) &&
          isDark(row, col + 3) &&
          isDark(row, col + 4) &&
          !isDark(row, col + 5) &&
          isDark(row, col + 6)) {
        lostPoint += 40
      }
    }
  }

  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount - 6; row += 1) {
      if (isDark(row, col) &&
          !isDark(row + 1, col) &&
          isDark(row + 2, col) &&
          isDark(row + 3, col) &&
          isDark(row + 4, col) &&
          !isDark(row + 5, col) &&
          isDark(row + 6, col)) {
        lostPoint += 40
      }
    }
  }

  // LEVEL4

  let darkCount = 0

  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount; row += 1) {
      if (isDark(row, col)) {
        darkCount += 1
      }
    }
  }

  const ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5
  lostPoint += ratio * 10

  return lostPoint
};

/**
 *
 * @param {boolean} test
 * @param {number} maskPattern
 * @param {QrCode} qrcode
 */
function setupTypeInfo (test, maskPattern, qrcode) {
  const { errorCorrectionLevel, modules, moduleCount } = qrcode

  const data = (errorCorrectionLevel << 3) | maskPattern
  const bits = getBCHTypeInfo(data)

  // vertical
  for (let i = 0; i < 15; i += 1) {
    const mod = (!test && ((bits >> i) & 1) === 1)

    if (i < 6) {
      modules[i][8] = mod
    } else if (i < 8) {
      modules[i + 1][8] = mod
    } else {
      modules[moduleCount - 15 + i][8] = mod
    }
  }

  // horizontal
  for (let i = 0; i < 15; i += 1) {
    const mod = (!test && ((bits >> i) & 1) === 1)

    if (i < 8) {
      modules[8][moduleCount - i - 1] = mod
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod
    } else {
      modules[8][15 - i - 1] = mod
    }
  }

  // fixed module
  modules[moduleCount - 8][8] = (!test)
};
