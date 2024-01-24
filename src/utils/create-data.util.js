import { QrBitBuffer } from './qr-bit-buffer.js'
import { ECBlocksInfo } from '../error-correction/qr-ec-block.utils.js'
import { getCharCountBitLength } from '../modes/mode-utils.util.js'
import { getErrorCorrectPolynomial } from '../error-correction/ec-polynomial.js'
import { QrPolynomial } from './qr-polynomial.js'

const PAD0 = 0xEC
const PAD1 = 0x11

/**
 *
 * @param {number} typeNumber - qr code version
 * @param {number} errorCorrectionLevel - error correction level
 * @param {readonly import ("../modes/mode-bits.constants.js").ModeObject[]} dataList - qr code raw data
 * @returns {number[]} qr code byte data
 */
export function createData (typeNumber, errorCorrectionLevel, dataList) {
  const blocksInfo = ECBlocksInfo(typeNumber, errorCorrectionLevel)
  const buffer = new QrBitBuffer()

  for (const data of dataList) {
    buffer.put(data.mode, 4)
    buffer.put(data.length, getCharCountBitLength(data.mode, typeNumber))
    data.write(buffer)
  }

  const totalDataCount = blocksInfo.totalDcCount

  if (buffer.bitLength > totalDataCount * 8) {
    throw Error(`code length overflow. (${buffer.bitLength} > ${totalDataCount * 8})`)
  }

  // end code
  if (buffer.bitLength + 4 <= totalDataCount * 8) {
    buffer.put(0, 4)
  }

  // padding
  while (buffer.bitLength % 8 !== 0) {
    buffer.putBit(0)
  }

  // padding
  while (true) {
    if (buffer.bitLength >= totalDataCount * 8) {
      break
    }
    buffer.put(PAD0, 8)

    if (buffer.bitLength >= totalDataCount * 8) {
      break
    }
    buffer.put(PAD1, 8)
  }

  return createBytes(buffer, blocksInfo)
};

/**
 * @param {QrBitBuffer} buffer - data buffer
 * @param {import('../error-correction/qr-ec-block.utils.js').ECBlocksInfo} blocksInfo - error correction blocks info
 */
function createBytes (buffer, blocksInfo) {
  const { maxDcCount, maxEcCount, blocks: ecBlocks, totalCount: totalCodeCount } = blocksInfo
  const { ecdata, dcdata } = createCodewordsData(buffer, ecBlocks)

  /** @type {number[]} */
  const data = new Array(totalCodeCount)
  let index = 0

  for (let i = 0; i < maxDcCount; i += 1) {
    for (let r = 0; r < ecBlocks.length; r += 1) {
      if (i < dcdata[r].length) {
        data[index] = dcdata[r][i]
        index += 1
      }
    }
  }

  for (let i = 0; i < maxEcCount; i += 1) {
    for (let r = 0; r < ecBlocks.length; r += 1) {
      if (i < ecdata[r].length) {
        data[index] = ecdata[r][i]
        index += 1
      }
    }
  }

  return data
};

/**
 * @param {QrBitBuffer} buffer - - data buffer
 * @param {import('../error-correction/qr-ec-block.utils.js').ECBlocks} ecBlocks - error correction blocks
 */
function createCodewordsData (buffer, ecBlocks) {
  let offset = 0

  /** @type {number[][]} */
  const dcdata = new Array(ecBlocks.length)
  /** @type {number[][]} */
  const ecdata = new Array(ecBlocks.length)

  for (let r = 0; r < ecBlocks.length; r += 1) {
    const dcCount = ecBlocks[r].dataCount
    const ecCount = ecBlocks[r].ecCount

    dcdata[r] = new Array(dcCount)

    for (let i = 0, e = dcdata[r].length; i < e; i += 1) {
      dcdata[r][i] = 0xff & buffer.byteBuffer[i + offset]
    }
    offset += dcCount

    const rsPoly = getErrorCorrectPolynomial(ecCount)
    const rawPoly = QrPolynomial(dcdata[r], rsPoly.length - 1)

    const modPoly = rawPoly.mod(rsPoly)
    ecdata[r] = new Array(rsPoly.length - 1)
    for (let i = 0; i < ecdata[r].length; i += 1) {
      const modIndex = i + modPoly.length - ecdata[r].length
      ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0
    }
  }

  return { ecdata, dcdata }
};
