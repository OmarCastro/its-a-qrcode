import { EC_BLOCK_TABLE } from './qr-ec-block-table.constants.js'
import { CORRECTION_LEVEL_M, CORRECTION_LEVEL_Q } from './ec-level.js'

/**
 * @param {number} totalCount - total codewords capacity
 * @param {number} dataCount - data codewords capacity
 * @returns {Readonly<ECBlock>} created Error Correction block object
 */
const ECBlock = (totalCount, dataCount) => Object.freeze({ totalCount, dataCount, ecCount: totalCount - dataCount })

/**
 * gets how much actual space there is in a QR Code, i.e. codewords that can be used to store data and error correction information in a specific version.
 *
 * Version 1 has no alignment pattern, so the amount of available modules is:
 *
 * 21**2 (441, where 21 is the size of the QR Code)
 * - 3⋅8⋅8 (192, for 3 finder patterns)
 * - 2⋅5 (10, the timing patterns)
 * - 1 (the dark module)
 * - 2⋅15 (30, the error level and mask information)
 *
 *
 * for a total of 208, i.e. 26 codewords.
 *
 * For larger versions, we have to compute this (let v the version number and n the number of alignment pattern coordinates):
 *
 * v2 (total modules)
 * - 3⋅8⋅8 (finder patterns)
 * - (n2 - 3)⋅5 (alignment patterns)
 * - 2⋅(4‍v + 1) (timing patterns)
 * + 2⋅(n - 2)⋅5 (readding the intersection of alignment and timing patterns)
 * - 1 (dark module)
 * - 2⋅3⋅6 (format data, only if v > 6)
 * @param {number} version - qr code version
 * @returns {number} total Count
 */
function getAvailableModules (version) {
  return version === 1 ? 208 : 16 * (version + 4) ** 2 - (5 * (Math.floor(version / 7) + 2) - 1) ** 2 - (version > 6 ? 172 : 136)
}

/**
 * @param {number} version - qr code version
 * @param {number} errorCorrectionLevel - numeric value of error Correction Level
 * @returns {ECBlocksInfo} block info
 */
function buildECBlocksInfo (version, errorCorrectionLevel) {
  const totalCount = getAvailableModules(version) >> 3
  const index = ((version - 1) * 4 + errorCorrectionLevel) * 2
  const blockAmount = EC_BLOCK_TABLE[index + 1]
  const group2Blocks = totalCount % blockAmount
  const group1Blocks = blockAmount - group2Blocks
  const totalBlockCount = Math.floor(totalCount / blockAmount)
  const ecBlockSize = EC_BLOCK_TABLE[index]
  const dcBlockSize = totalBlockCount - ecBlockSize

  const totalDcCount = dcBlockSize * group1Blocks + (dcBlockSize + 1) * group2Blocks
  const totalEcCount = ecBlockSize * blockAmount
  const maxDcCount = dcBlockSize + (group2Blocks > 0 ? 1 : 0)
  const maxEcCount = ecBlockSize
  const blocks = Object.freeze([
    ...new Array(group1Blocks).fill(ECBlock(totalBlockCount, dcBlockSize)),
    ...new Array(group2Blocks).fill(ECBlock(totalBlockCount + 1, dcBlockSize + 1)),
  ])
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
