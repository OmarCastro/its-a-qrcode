import { RS_BLOCK_TABLE } from './qr-rs-block-table.constants.js'
import { CORRECTION_LEVEL_L, CORRECTION_LEVEL_M, CORRECTION_LEVEL_Q, CORRECTION_LEVEL_H } from './qr-rs-correction-level.constants.js'

/**
 *
 * @param {number} totalCount
 * @param {number} dataCount
 */
const qrRSBlock = (totalCount, dataCount) => Object.freeze({ totalCount, dataCount })

/**
 *
 * @param {number} typeNumber
 * @param {number} errorCorrectionLevel
 */
const getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case CORRECTION_LEVEL_L : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0]
    case CORRECTION_LEVEL_M : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1]
    case CORRECTION_LEVEL_Q : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2]
    case CORRECTION_LEVEL_H : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3]
    default :
      return undefined
  }
}

/**
 *
 * @param {number} typeNumber
 * @param {number} errorCorrectionLevel
 */
export const getRSBlocks = function (typeNumber, errorCorrectionLevel) {
  const rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel)

  if (typeof rsBlock === 'undefined') {
    throw Error(`bad rs block @ typeNumber:${typeNumber}', errorCorrectionLevel: ${errorCorrectionLevel}`)
  }

  const length = rsBlock.length / 3

  const list = []

  for (let i = 0; i < length; i += 1) {
    const count = rsBlock[i * 3 + 0]
    const totalCount = rsBlock[i * 3 + 1]
    const dataCount = rsBlock[i * 3 + 2]

    for (let j = 0; j < count; j += 1) {
      list.push(qrRSBlock(totalCount, dataCount))
    }
  }

  return list
}
