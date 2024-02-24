import { test } from '../../test-utils/unit/test.util.js'
import { ECBlocksInfo } from './qr-ec-block.utils.js'
import { fromString } from './ec-level.js'
/**
 * Error Correction characteristics for QR Code
 */
const ECCharacteristics = [
  {
    version: 1,
    totalCodewordCount: 26,
    counts: {
      L: {totalDc: 19, totalEc: 7, maxDc: 19, maxEc: 7},
      M: {totalDc: 16, totalEc: 10, maxDc: 16, maxEc: 10},
      Q: {totalDc: 13, totalEc: 13, maxDc: 13, maxEc: 13},
      H: {totalDc: 9, totalEc: 17, maxDc: 9, maxEc: 17},
    }

    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 2,
    totalCodewordCount: 44,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 3,
    totalCodewordCount: 70,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 4,
    totalCodewordCount: 100,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 5,
    totalCodewordCount: 134,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 6,
    totalCodewordCount: 172,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 7,
    totalCodewordCount: 196,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 8,
    totalCodewordCount: 242,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 9,
    totalCodewordCount: 292,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 10,
    totalCodewordCount: 346,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 11,
    totalCodewordCount: 404,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 12,
    totalCodewordCount: 466,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 13,
    totalCodewordCount: 532,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 14,
    totalCodewordCount: 581,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 15,
    totalCodewordCount: 655,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 16,
    totalCodewordCount: 733,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 17,
    totalCodewordCount: 815,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 18,
    totalCodewordCount: 901,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 19,
    totalCodewordCount: 991,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 20,
    totalCodewordCount: 1085,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 21,
    totalCodewordCount: 1156,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 22,
    totalCodewordCount: 1258,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 23,
    totalCodewordCount: 1364,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 24,
    totalCodewordCount: 1474,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 25,
    totalCodewordCount: 1588,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 26,
    totalCodewordCount: 1706,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 27,
    totalCodewordCount: 1828,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 28,
    totalCodewordCount: 1921,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 29,
    totalCodewordCount: 2051,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 30,
    totalCodewordCount: 2185,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 31,
    totalCodewordCount: 2323,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 32,
    totalCodewordCount: 2465,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 33,
    totalCodewordCount: 2611,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 34,
    totalCodewordCount: 2761,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 35,
    totalCodewordCount: 2876,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 36,
    totalCodewordCount: 3034,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 37,
    totalCodewordCount: 3196,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 38,
    totalCodewordCount: 3362,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 39,
    totalCodewordCount: 3532,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  }, {
    version: 40,
    totalCodewordCount: 3706,
    // totalECCodeWordCount: { L: 7, M: 10, Q: 13, H: 17 },
  },
]

const ECLevels = 'LMQH'.split('').map(fromString)

test('Error correction block - ECBlocksInfo is the same instance if equal (a.k.a. is memoized) ', ({ expect }) => {
  const checks = ECCharacteristics.map((versionChar) => ECLevels.map(level => ECBlocksInfo(versionChar.version, level.bit) === ECBlocksInfo(versionChar.version, level.bit)))
  const expeced = ECCharacteristics.map(() => [true, true, true, true])
  expect(checks).toEqual(expeced)
})


test('Error correction block - ECBlocksInfo EC and DC counts are valid', ({ expect }) => {
  const checks = ECCharacteristics.map((versionChar) => {
    const {counts} = versionChar
    if(!counts){
      return undefined
    }
    return Object.fromEntries(ECLevels.map(level => {
      const {totalDcCount, totalEcCount, maxEcCount, maxDcCount} = ECBlocksInfo(versionChar.version, level.bit)
      return [level.name[0], {totalDc: totalDcCount, totalEc: totalEcCount, maxDc: maxDcCount, maxEc: maxEcCount}]
    }))
  })
  const expeced = ECCharacteristics.map((versionChar) => versionChar.counts)
  expect(checks).toEqual(expeced)
})



test('Error correction block - ECBlocksInfo throws error on invalid inputs', ({ expect }) => {
  const checks = [
    [0, 1],
    [1, ""],
    [1, 40],
    [undefined, 2],
    [9000, 1],
  ].map(params => {
    try { ECBlocksInfo(...params); return "did not throw" }
    catch { return "did throw" }
  })
  const expeced = new Array(checks.length).fill("did throw")
  expect(checks).toEqual(expeced)
})



test('Error correction block - all blocks have the same total number of codewords in a version', ({ expect }) => {
  const checks = ECCharacteristics.map((versionChar) => ECLevels.map(level => ECBlocksInfo(versionChar.version, level.bit).totalCount === versionChar.totalCodewordCount))
  const expeced = ECCharacteristics.map(() => [true, true, true, true])
  expect(checks).toEqual(expeced)
})


