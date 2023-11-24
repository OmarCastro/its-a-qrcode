import { EC_BLOCK_TABLE } from './qr-ec-block-table.constants.js'
import { CORRECTION_LEVEL_M, CORRECTION_LEVEL_Q } from './ec-level.js'

/**
 * @param {number} totalCount - total codewords capacity
 * @param {number} dataCount - data codewords capacity
 * @returns {Readonly<ECBlock>} created Error Correction block object
 */
const ECBlock = (totalCount, dataCount) => Object.freeze({ totalCount, dataCount, ecCount: totalCount - dataCount })

/**
 * @param {number} typeNumber - qr code version
 * @param {number} errorCorrectionLevel - numeric value of error Correction Level
 */
const queryECBlocks = function (typeNumber, errorCorrectionLevel) {
  const index = (typeNumber - 1) * 4 + errorCorrectionLevel
  const rawEcBlock = EC_BLOCK_TABLE[index]

  const length = rawEcBlock.length / 3

  const list = []

  for (let i = 0; i < length; i += 1) {
    const count = rawEcBlock[i * 3 + 0]
    const totalCount = rawEcBlock[i * 3 + 1]
    const dataCount = rawEcBlock[i * 3 + 2]

    for (let j = 0; j < count; j += 1) {
      list.push(ECBlock(totalCount, dataCount))
    }
  }

  return Object.freeze(list)
}

/**
 * @param {number} typeNumber - qr code version
 * @param {number} errorCorrectionLevel - numeric value of error Correction Level
 * @returns {ECBlocksInfo} block info
 */
function buildECBlocksInfo (typeNumber, errorCorrectionLevel) {
  const blocks = queryECBlocks(typeNumber, errorCorrectionLevel)
  let totalCount = 0
  let totalDcCount = 0
  let totalEcCount = 0
  let maxDcCount = 0
  let maxEcCount = 0

  for (const block of blocks) {
    totalCount += block.totalCount
    totalDcCount += block.dataCount
    totalEcCount += block.ecCount
    maxDcCount = Math.max(maxDcCount, block.dataCount)
    maxEcCount = Math.max(maxEcCount, block.ecCount)
  }

  return Object.freeze({ blocks, totalCount, totalDcCount, totalEcCount, maxDcCount, maxEcCount })
}

/**
 * The idea was to pre-calculate everything on the EC block table, but it is better to memoize to reduce JS hydration
 */
const memoEcBlockInfo = /** @type {ECBlocksInfo[]} */([])

/**
 * @param {number} typeNumber - qr code version
 * @param {number} errorCorrectionLevel - numeric value of error Correction Level
 * @returns {ECBlocksInfo} error correction blocks information
 */
export function ECBlocksInfo (typeNumber, errorCorrectionLevel) {
  versionEcCheck(typeNumber, errorCorrectionLevel)
  const index = (typeNumber - 1) * 4 + errorCorrectionLevel
  const memo = memoEcBlockInfo[index]
  if (memo) {
    return memo
  }
  const result = buildECBlocksInfo(typeNumber, errorCorrectionLevel)
  memoEcBlockInfo[index] = result
  return result
}

/**
 * @param {number} typeNumber - qr code version
 * @param {number} errorCorrectionLevel - numeric value of error Correction Level
 */
function versionEcCheck (typeNumber, errorCorrectionLevel) {
  if (
    typeof errorCorrectionLevel !== 'number' ||
    typeof typeNumber !== 'number' ||
    errorCorrectionLevel < CORRECTION_LEVEL_M ||
    errorCorrectionLevel > CORRECTION_LEVEL_Q ||
    typeNumber < 1 ||
    typeNumber > 40
  ) {
    throw Error(`bad rs block @ typeNumber:${typeNumber}', errorCorrectionLevel: ${errorCorrectionLevel}`)
  }
}

/**
 * @typedef {object} ECBlocksInfoData
 * @property {ECBlocks} blocks - total codewords count capacity
 * @property {number} totalCount - total codewords count
 * @property {number} totalDcCount - total data codewords count
 * @property {number} totalEcCount - total error correction codewords count
 * @property {number} maxDcCount - max data codewords count capacity
 * @property {number} maxEcCount - max error codewords count capacity
 */

/**
 * @typedef {Readonly<ECBlocksInfoData>} ECBlocksInfo Error Correction blocks information
 */

/**
 * @typedef {object} ECBlockData - Error Correction block
 * @property {number} totalCount - total codewords count capacity
 * @property {number} dataCount - data codewords count capacity
 * @property {number} ecCount - error correction codewords count capacity
 */

/**
 * @typedef {Readonly<ECBlockData>} ECBlock Error Correction block
 */

/**
 * @typedef {readonly ECBlock[]} ECBlocks Error Correction blocks
 */
