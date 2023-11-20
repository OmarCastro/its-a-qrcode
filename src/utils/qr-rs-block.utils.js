import { RS_BLOCK_TABLE } from './qr-rs-block-table.constants.js'
import { CORRECTION_LEVEL_L, CORRECTION_LEVEL_M, CORRECTION_LEVEL_Q, CORRECTION_LEVEL_H } from './qr-rs-correction-level.constants.js'

/**
 *
 * @param {number} totalCount - total codewords capacity
 * @param {number} dataCount - data codewords capacity
 */
const qrRSBlock = (totalCount, dataCount) => Object.freeze({ totalCount, dataCount, ecCount: totalCount - dataCount })

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
const calculateRSBlocks = function (typeNumber, errorCorrectionLevel) {
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

  return Object.freeze(list)
}

/**
 * used to memoize calculateRSBlocks calculations.
 * Each time a qr code is calculated, getRSBlocks is called at least 2 times:
 * - 1 time to calculate the best version number to generate the QR code
 * - 1 time to generate the data
 * This way, calculateRSBlocks is calculated only once and there is no problem returning the same object because the result is an immutable object
 * Since the memory footprint is small, there is little disadvantage in memoizing it
 */
const memoRsBlocks = /** @type {ReturnType<calculateRSBlocks>[]} */([])

/**
 *
 * @param {number} typeNumber
 * @param {number} errorCorrectionLevel
 */
export const getRSBlocks = function (typeNumber, errorCorrectionLevel) {
  if (errorCorrectionLevel < CORRECTION_LEVEL_M && errorCorrectionLevel > CORRECTION_LEVEL_Q) {
    throw Error(`bad rs block @ typeNumber:${typeNumber}', errorCorrectionLevel: ${errorCorrectionLevel}`)
  }
  const index = (typeNumber - 1) * 4 + errorCorrectionLevel
  const memo = memoRsBlocks[index]
  if (memo) {
    return memo
  }
  const result = calculateRSBlocks(typeNumber, errorCorrectionLevel)
  memoRsBlocks[index] = result
  return result
}
