import { ECBlocksInfo } from './error-correction/qr-ec-block.utils.js'
import { fromString, CORRECTION_LEVEL_M } from './error-correction/ec-level.js'
import { getPatternPositions } from './utils/alignment-pattern.util.js'
import { getBCHTypeInfo, getBCHTypeNumber } from './utils/qr-util.js'
import { getMaskPatternFunction } from './mask-pattern/qr-mask-pattern.util.js'
import { createData } from './utils/create-data.util.js'
import { QrKanji } from './modes/kanji.mode.js'
import { Qr8BitByte } from './modes/byte.mode.js'
import { QrNumber } from './modes/number.mode.js'
import { QrAlphaNum } from './modes/alphanum.mode.js'
import { getBestMode, getCharCountBitLength } from './modes/mode-utils.util.js'
import { QrBitBuffer } from './utils/qr-bit-buffer.js'

export const NEIGHBOR_TOP_LEFT = 0b100_000_000
export const NEIGHBOR_TOP = 0b010_000_000
export const NEIGHBOR_TOP_RIGHT = 0b001_000_000
export const NEIGHBOR_LEFT = 0b000_100_000
export const NEIGHBOR_SELF = 0b000_010_000
export const NEIGHBOR_RIGHT = 0b000_001_000

export class QrCode {
  /** @type {number} */
  typeNumber = 0

  /** @type {number} */

  errorCorrectionLevel
  /**
   * module count is the amount of modules in the QR Code
   * The module refers to the black and white dots that make up QR Code.
   * @example moduleCount = 21 // QR code is a 21x21 matrix
   */
  moduleCount
  modules
  /** @type {number[] | null} */
  #dataCache
  /** @type {ReturnType<QrKanji | Qr8BitByte | QrNumber | QrAlphaNum>[] } */
  dataList

  /**
   * @param {number} typeNumber - QR code version from 1 to 40
   * @param {string} errorCorrectionLevel - error correction level, accepted values (case insensitive): l, low, m, medium, q, quartile, h, high
   */
  constructor (typeNumber = 0, errorCorrectionLevel = '') {
    this.typeNumber = typeNumber ?? 0
    this.errorCorrectionLevel = errorCorrectionLevel ? fromString(errorCorrectionLevel).bit : CORRECTION_LEVEL_M
    this.moduleCount = 0
    this.modules = createModuleTable(this.moduleCount)
    this.#dataCache = null
    this.dataList = []
  }

  /**
   *
   * @param {boolean} test - flag to determine if it is used for mask pattern evaluation
   * @param {number} maskPattern - mask pattern to use
   */
  makeImpl (test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17

    const moduleCount = this.moduleCount
    this.modules = createModuleTable(moduleCount)
    setupPositionProbePatterns(this)
    setupPositionAdjustPattern(this)
    setupTimingPattern(this)
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
   * @param {number} row - vertical position
   * @param {number} col - horizontal position
   * @returns {boolean} true if cell is a dark spot, false otherwise
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
   * @param {string} data - text data
   * @param {'Byte'|'Numeric'|'Alphanumeric'|'Kanji'} [mode] - qr mode to use, uses best mode if absent
   */
  addData (data, mode) {
    switch (mode) {
      case 'Numeric' : this.dataList.push(QrNumber(data)); break
      case 'Alphanumeric' : this.dataList.push(QrAlphaNum(data)); break
      case 'Byte' : this.dataList.push(Qr8BitByte(data)); break
      case 'Kanji' : this.dataList.push(QrKanji(data)); break
      case null:
      case undefined: this.dataList.push(getBestMode(data)); break
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
 * Gets the position of position detection pattern for the QR Code and draws them
 * @see drawPositionProbePattern to get more information about position detection pattern
 * @param {QrCode} qrcode - qr code object
 */
function setupPositionProbePatterns (qrcode) {
  const { moduleCount } = qrcode
  drawPositionProbePattern(qrcode, 0, 0)
  drawPositionProbePattern(qrcode, moduleCount - 7, 0)
  drawPositionProbePattern(qrcode, 0, moduleCount - 7)
};

/**
 * Draws a position detection pattern, one of three identical components of the Finder Pattern, normally on the top left, top right and bottom left
 * They require a blank space as separators for Position Detection Patterns
 * @example top right position detection pattern
 *   ┌─ blank space separator
 *   │ ┌─ (row, col)
 *   v v
 * ██  ██████████████
 *     ██          ██
 * ██  ██  ██████  ██
 *     ██  ██████  ██
 * ██  ██  ██████  ██
 * ██  ██          ██
 *     ██████████████
 * ██                 <- blank space separator
 *   ██  ██    ██  ██
 * @param {QrCode} qrcode - qr code object
 * @param {number} row - row position of the left part of the rectangle, see example
 * @param {number} col - column position of the left part of the rectangle, see example
 */
function drawPositionProbePattern (qrcode, row, col) {
  const { modules, moduleCount } = qrcode
  const rowMin = row === 0 ? 0 : -1
  const rowMax = row + 7 >= moduleCount ? moduleCount - row - 1 : 7
  const colMin = col === 0 ? 0 : -1
  const colMax = col + 7 >= moduleCount ? moduleCount - col - 1 : 7

  for (let r = rowMin; r <= rowMax; r += 1) {
    for (let c = colMin; c <= colMax; c += 1) {
      const isDarkSpot = (
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      )
      modules[row + r][col + c] = isDarkSpot
    }
  }
};

/**
 * @param {QrCode} qrcode - qr code object
 * @returns {number} type number
 */
function getBestTypeNumber (qrcode) {
  const { errorCorrectionLevel, dataList } = qrcode

  for (let typeNumber = 1; typeNumber < 40; typeNumber++) {
    const ecBlocksInfo = ECBlocksInfo(typeNumber, errorCorrectionLevel)
    const buffer = new QrBitBuffer()

    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i]
      buffer.put(data.mode, 4)
      buffer.put(data.length, getCharCountBitLength(data.mode, typeNumber))
      data.write(buffer)
    }

    if (buffer.bitLength <= ecBlocksInfo.totalDcCount * 8) {
      return typeNumber
    }
  }

  throw Error('data length too high to detect type number')
}

/**
 * @param {number} moduleCount - module count of a size of the matrix
 * @returns {boolean[][]} module table
 */
function createModuleTable (moduleCount) {
  const modules = new Array(moduleCount)
  for (let row = 0; row < moduleCount; row += 1) {
    modules[row] = new Array(moduleCount).fill(null)
  }
  return modules
}

/**
 * @param {QrCode} qrcode - qr code object
 * @returns {number} - byte value of mask pattern with less penalty points
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
 * Gets the position of alignment patterns for the QR Code and draws them (the small rectangles in the rectangles in the QR Code)
 * @see paintAlignmentPattern to get more information about alignment patterns
 * @param {QrCode} qrcode - qr code object
 */
function setupPositionAdjustPattern (qrcode) {
  for (const [row, col] of getPatternPositions(qrcode.typeNumber)) {
    paintAlignmentPattern(qrcode, row, col)
  }
}

/**
 * Draws an alignment pattern.
 *
 * Alignment pattern is a fixed reference pattern in defined positions in a matrix symbology,
 * which enables the decode software to resynchronise the coordinate mapping of the image modules
 * in the event of moderate amounts of distortion of the image
 * @example
 * ██████████
 * ██      ██
 * ██  ██  ██
 * ██      ██
 * ██████████
 * @param {QrCode} qrcode - qr code object
 * @param {number} row - row position of the center of alignment pattern
 * @param {number} col - column position of the center of alignment pattern
 */
function paintAlignmentPattern (qrcode, row, col) {
  const { modules } = qrcode

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

/**
 * Draw the QR code timing pattern.
 *
 * A timing Pattern is an alternating sequence of dark and light modules enabling module
 * coordinates in the symbol to be determined.
 * @example
 *                avoid drawing on
 *               alignment patterns
 * █▀▀▀▀▀█               v               █▀▀▀▀▀█
 * █ ███ █             ▄▄▄▄▄             █ ███ █
 * █ ▀▀▀ █ ▄ ▄ ▄ ▄ ▄ ▄ █ ▄ █ ▄ ▄ ▄ ▄ ▄ ▄ █ ▀▀▀ █
 * ▀▀▀▀▀▀▀     ^       █▄▄▄█   ^         ▀▀▀▀▀▀▀
 *      ▀   < timing patterns ─┘
 *      ▀
 *      ▀
 * @param {QrCode} qrcode - qr code object
 */
function setupTimingPattern (qrcode) {
  const { modules, moduleCount } = qrcode

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
 * @param {boolean} test - flag to determine if it is used for mask pattern evaluation
 * @param {QrCode} qrcode - qr code object
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
 * @param {number[]} data - bit data of qrcode
 * @param {number} maskPattern - mask pattern number
 * @param {QrCode} qrcode - qr code object
 */
// eslint-disable-next-line sonarjs/cognitive-complexity -- it's low level and simple enough
function mapData (data, maskPattern, qrcode) {
  const { moduleCount, modules } = qrcode

  let inc = -1
  let row = moduleCount - 1
  let bitIndex = 7
  let byteIndex = 0
  const maskFunc = getMaskPatternFunction(maskPattern)

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
 * Calculates the penalty point of QR Code, used to evaluate the masking results
 *
 * After performing the masking operation with each Mask Pattern in turn, the results shall be evaluated by scoring
 * penalty points for each occurrence of the following features. The higher the number of points, the less acceptable
 * the result. In the table, the variables N1 to N4 represent weighted penalty scores for the undesirable features
 * (N1 = 3, N2 = 3, N3 = 40, N4 = 10), i is the amount by which the number of adjacent modules of the same color exceeds 5
 * and k is the rating of the deviation of the proportion of dark modules in the symbol from 50% in steps of 5%.
 * Although the masking operation is only performed on the encoding region of the symbol excluding the Format
 * Information, the area to be evaluated is the complete symbol
 * @example
 * ┌──────────────────────────────────────────────┬───────────────────────────────────────┬─────────────────────────┐
 * │ Feature                                      │ Evaluation                            │ condition Points        │
 * ├──────────────────────────────────────────────┼───────────────────────────────────────┼─────────────────────────┤
 * │ Adjacent modules in row/column in same color │  No. of modules = (5 + i)             │  N1 + i                 │
 * │                                              │                                       │                         │
 * │ Block of modules in same color               │  Block size = m * n                   │  N2 * (m - 1) * (n - 1) │
 * │                                              │                                       │                         │
 * │ 1:1:3:1:1 ratio (dark:light:dark:light:dark) │                                       │  N3                     │
 * │ pattern in row/column                        │                                       │                         │
 * │                                              │                                       │                         │
 * │ Proportion of dark modules in entire symbol  │  50 ± (5 * k)% to 50 ± (5 * (k + 1))% │  N4 * k                 │
 * └──────────────────────────────────────────────┴───────────────────────────────────────┴─────────────────────────┘
 *                         Evaluation table from ISO/IEC 18004:2000(E) International Standard
 * @param {QrCode} qrcode - qr code object
 * @returns {number} calculated penalty points
 */
// eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity -- even it we split one function per level, we would have to use eslint-disable in them anyway
export function getLostPoint (qrcode) {
  const { moduleCount, modules } = qrcode
  /** @type {(r:number, c:number) => boolean} */
  const isDark = (r, c) => modules[r][c]
  let lostPoint = 0

  // Feature 1 - Adjacent modules in row/column in same color

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

  // Feature 2 - Block of modules in same color

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

  // Feature 3 - 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column

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

  // Feature 4 - Proportion of dark modules in entire symbol

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
 * @param {boolean} test - flag to determine if it is used for mask pattern evaluation
 * @param {number} maskPattern - mask pattern number
 * @param {QrCode} qrcode - qr code object
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
