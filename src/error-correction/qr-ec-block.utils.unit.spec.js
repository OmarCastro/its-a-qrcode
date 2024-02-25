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
      L: { totalDc: 19, totalEc: 7, maxDc: 19, maxEc: 7 },
      M: { totalDc: 16, totalEc: 10, maxDc: 16, maxEc: 10 },
      Q: { totalDc: 13, totalEc: 13, maxDc: 13, maxEc: 13 },
      H: { totalDc: 9, totalEc: 17, maxDc: 9, maxEc: 17 },
    }
  }, {
    version: 2,
    totalCodewordCount: 44,
    counts: {
      L: { totalDc: 34, totalEc: 10, maxDc: 34, maxEc: 10 },
      M: { totalDc: 28, totalEc: 16, maxDc: 28, maxEc: 16 },
      Q: { totalDc: 22, totalEc: 22, maxDc: 22, maxEc: 22 },
      H: { totalDc: 16, totalEc: 28, maxDc: 16, maxEc: 28 },
    }
  }, {
    version: 3,
    totalCodewordCount: 70,
    counts: {
      L: { totalDc: 55, totalEc: 15, maxDc: 55, maxEc: 15 },
      M: { totalDc: 44, totalEc: 26, maxDc: 44, maxEc: 26 },
      Q: { totalDc: 34, totalEc: 36, maxDc: 17, maxEc: 18 },
      H: { totalDc: 26, totalEc: 44, maxDc: 13, maxEc: 22 },
    }
  }, {
    version: 4,
    totalCodewordCount: 100,
    counts: {
      L: { totalDc: 80, totalEc: 20, maxDc: 80, maxEc: 20 },
      M: { totalDc: 64, totalEc: 36, maxDc: 32, maxEc: 18 },
      Q: { totalDc: 48, totalEc: 52, maxDc: 24, maxEc: 26 },
      H: { totalDc: 36, totalEc: 64, maxDc: 9, maxEc: 16 }
    }  
  }, {
    version: 5,
    totalCodewordCount: 134,
    counts: {
      L: { totalDc: 108, totalEc: 26, maxDc: 108, maxEc: 26 },
      M: { totalDc: 86, totalEc: 48, maxDc: 43, maxEc: 24 }, 
      Q: { totalDc: 62, totalEc: 72, maxDc: 16, maxEc: 18 },
      H: { totalDc: 46, totalEc: 88, maxDc: 12, maxEc: 22 }
    }
  }, {
    version: 6,
    totalCodewordCount: 172,
    counts: {
      L: { totalDc: 136, totalEc: 36, maxDc: 68, maxEc: 18 },
      M: { totalDc: 108, totalEc: 64, maxDc: 27, maxEc: 16 },
      Q: { totalDc: 76, totalEc: 96, maxDc: 19, maxEc: 24 },
      H: { totalDc: 60, totalEc: 112, maxDc: 15, maxEc: 28 } 
    }
  }, {
    version: 7,
    totalCodewordCount: 196,
    counts: {
      L: { totalDc: 156, totalEc: 40, maxDc: 78, maxEc: 20 },
      M: { totalDc: 124, totalEc: 72, maxDc: 31, maxEc: 18 },
      Q: { totalDc: 88, totalEc: 108, maxDc: 15, maxEc: 18 },
      H: { totalDc: 66, totalEc: 130, maxDc: 14, maxEc: 26 }
    }
  }, {
    version: 8,
    totalCodewordCount: 242,
    counts: {
      L: { totalDc: 194, totalEc: 48, maxDc: 97, maxEc: 24 },
      M: { totalDc: 154, totalEc: 88, maxDc: 39, maxEc: 22 },
      Q: { totalDc: 110, totalEc: 132, maxDc: 19, maxEc: 22 },
      H: { totalDc: 86, totalEc: 156, maxDc: 15, maxEc: 26 }
    }
  }, {
    version: 9,
    totalCodewordCount: 292,
    counts: {
      L: { totalDc: 232, totalEc: 60, maxDc: 116, maxEc: 30 },
      M: { totalDc: 182, totalEc: 110, maxDc: 37, maxEc: 22 },
      Q: { totalDc: 132, totalEc: 160, maxDc: 17, maxEc: 20 },
      H: { totalDc: 100, totalEc: 192, maxDc: 13, maxEc: 24 }
      }
  }, {
    version: 10,
    totalCodewordCount: 346,
    counts: {
      L: { totalDc: 274, totalEc: 72, maxDc: 69, maxEc: 18 },
      M: { totalDc: 216, totalEc: 130, maxDc: 44, maxEc: 26 },
      Q: { totalDc: 154, totalEc: 192, maxDc: 20, maxEc: 24 }, 
      H: { totalDc: 122, totalEc: 224, maxDc: 16, maxEc: 28 }  
    }
  }, {
    version: 11,
    totalCodewordCount: 404,
    counts: {
      L: { totalDc: 324, totalEc: 80, maxDc: 81, maxEc: 20 },
      M: { totalDc: 254, totalEc: 150, maxDc: 51, maxEc: 30 },
      Q: { totalDc: 180, totalEc: 224, maxDc: 23, maxEc: 28 },
      H: { totalDc: 140, totalEc: 264, maxDc: 13, maxEc: 24 }   
    }
  }, {
    version: 12,
    totalCodewordCount: 466,
    counts: {
      L: { totalDc: 370, totalEc: 96, maxDc: 93, maxEc: 24 }, 
      M: { totalDc: 290, totalEc: 176, maxDc: 37, maxEc: 22 }, 
      Q: { totalDc: 206, totalEc: 260, maxDc: 21, maxEc: 26 }, 
      H: { totalDc: 158, totalEc: 308, maxDc: 15, maxEc: 28 } 
    }
  }, {
    version: 13,
    totalCodewordCount: 532,
    counts: {
      L: { totalDc: 428, totalEc: 104, maxDc: 107, maxEc: 26 },
      M: { totalDc: 334, totalEc: 198, maxDc: 38, maxEc: 22 },
      Q: { totalDc: 244, totalEc: 288, maxDc: 21, maxEc: 24 },
      H: { totalDc: 180, totalEc: 352, maxDc: 12, maxEc: 22 }
    }
  }, {
    version: 14,
    totalCodewordCount: 581,
    counts: {
      L: { totalDc: 461, totalEc: 120, maxDc: 116, maxEc: 30 },
      M: { totalDc: 365, totalEc: 216, maxDc: 41, maxEc: 24 },
      Q: { totalDc: 261, totalEc: 320, maxDc: 17, maxEc: 20 },
      H: { totalDc: 197, totalEc: 384, maxDc: 13, maxEc: 24 }
    }
  }, {
    version: 15,
    totalCodewordCount: 655,
    counts: {
      L: { totalDc: 523, totalEc: 132, maxDc: 88, maxEc: 22 },
      M: { totalDc: 415, totalEc: 240, maxDc: 42, maxEc: 24 },
      Q: { totalDc: 295, totalEc: 360, maxDc: 25, maxEc: 30 },
      H: { totalDc: 223, totalEc: 432, maxDc: 13, maxEc: 24 }
    }
  }, {
    version: 16,
    totalCodewordCount: 733,
    counts: {
      L: { totalDc: 589, totalEc: 144, maxDc: 99, maxEc: 24 },
      M: { totalDc: 453, totalEc: 280, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 325, totalEc: 408, maxDc: 20, maxEc: 24 },
      H: { totalDc: 253, totalEc: 480, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 17,
    totalCodewordCount: 815,
    counts: {
      L: { totalDc: 647, totalEc: 168, maxDc: 108, maxEc: 28 },
      M: { totalDc: 507, totalEc: 308, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 367, totalEc: 448, maxDc: 23, maxEc: 28 },
      H: { totalDc: 283, totalEc: 532, maxDc: 15, maxEc: 28 }
    }
  },
  {
    version: 18,
    totalCodewordCount: 901,
    counts: {
      L: { totalDc: 721, totalEc: 180, maxDc: 121, maxEc: 30 },
      M: { totalDc: 563, totalEc: 338, maxDc: 44, maxEc: 26 },
      Q: { totalDc: 397, totalEc: 504, maxDc: 23, maxEc: 28 },
      H: { totalDc: 313, totalEc: 588, maxDc: 15, maxEc: 28 }
    }
  },
  {
    version: 19,
    totalCodewordCount: 991,
    counts: {
      L: { totalDc: 795, totalEc: 196, maxDc: 114, maxEc: 28 },
      M: { totalDc: 627, totalEc: 364, maxDc: 45, maxEc: 26 },
      Q: { totalDc: 445, totalEc: 546, maxDc: 22, maxEc: 26 },
      H: { totalDc: 341, totalEc: 650, maxDc: 14, maxEc: 26 }
    }
  },
  {
    version: 20,
    totalCodewordCount: 1085,
    counts: {
      L: { totalDc: 861, totalEc: 224, maxDc: 108, maxEc: 28 },
      M: { totalDc: 669, totalEc: 416, maxDc: 42, maxEc: 26 },
      Q: { totalDc: 485, totalEc: 600, maxDc: 25, maxEc: 30 },
      H: { totalDc: 385, totalEc: 700, maxDc: 16, maxEc: 28 }
    }
  },
  {
    version: 21,
    totalCodewordCount: 1156,
    counts: {
      L: { totalDc: 932, totalEc: 224, maxDc: 117, maxEc: 28 },
      M: { totalDc: 714, totalEc: 442, maxDc: 42, maxEc: 26 },
      Q: { totalDc: 512, totalEc: 644, maxDc: 23, maxEc: 28 },
      H: { totalDc: 406, totalEc: 750, maxDc: 17, maxEc: 30 }
    }
  },
  {
    version: 22,
    totalCodewordCount: 1258,
    counts: {
      L: { totalDc: 1006, totalEc: 252, maxDc: 112, maxEc: 28 },
      M: { totalDc: 782, totalEc: 476, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 568, totalEc: 690, maxDc: 25, maxEc: 30 },
      H: { totalDc: 442, totalEc: 816, maxDc: 13, maxEc: 24 }
    }
  },
  {
    version: 23,
    totalCodewordCount: 1364,
    counts: {
      L: { totalDc: 1094, totalEc: 270, maxDc: 122, maxEc: 30 },
      M: { totalDc: 860, totalEc: 504, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 614, totalEc: 750, maxDc: 25, maxEc: 30 },
      H: { totalDc: 464, totalEc: 900, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 24,
    totalCodewordCount: 1474,
    counts: {
      L: { totalDc: 1174, totalEc: 300, maxDc: 118, maxEc: 30 },
      M: { totalDc: 914, totalEc: 560, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 664, totalEc: 810, maxDc: 25, maxEc: 30 },
      H: { totalDc: 514, totalEc: 960, maxDc: 17, maxEc: 30 }
    }
  },
  {
    version: 25,
    totalCodewordCount: 1588,
    counts: {
      L: { totalDc: 1276, totalEc: 312, maxDc: 107, maxEc: 26 },
      M: { totalDc: 1000, totalEc: 588, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 718, totalEc: 870, maxDc: 25, maxEc: 30 },
      H: { totalDc: 538, totalEc: 1050, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 26,
    totalCodewordCount: 1706,
    counts: {
      L: { totalDc: 1370, totalEc: 336, maxDc: 115, maxEc: 28 },
      M: { totalDc: 1062, totalEc: 644, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 754, totalEc: 952, maxDc: 23, maxEc: 28 },
      H: { totalDc: 596, totalEc: 1110, maxDc: 17, maxEc: 30 }
    }
  },
  {
    version: 27,
    totalCodewordCount: 1828,
    counts: {
      L: { totalDc: 1468, totalEc: 360, maxDc: 123, maxEc: 30 },
      M: { totalDc: 1128, totalEc: 700, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 808, totalEc: 1020, maxDc: 24, maxEc: 30 },
      H: { totalDc: 628, totalEc: 1200, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 28,
    totalCodewordCount: 1921,
    counts: {
      L: { totalDc: 1531, totalEc: 390, maxDc: 118, maxEc: 30 },
      M: { totalDc: 1193, totalEc: 728, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 871, totalEc: 1050, maxDc: 25, maxEc: 30 },
      H: { totalDc: 661, totalEc: 1260, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 29,
    totalCodewordCount: 2051,
    counts: {
      L: { totalDc: 1631, totalEc: 420, maxDc: 117, maxEc: 30 },
      M: { totalDc: 1267, totalEc: 784, maxDc: 46, maxEc: 28 },
      Q: { totalDc: 911, totalEc: 1140, maxDc: 24, maxEc: 30 },
      H: { totalDc: 701, totalEc: 1350, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 30,
    totalCodewordCount: 2185,
    counts: {
      L: { totalDc: 1735, totalEc: 450, maxDc: 116, maxEc: 30 },
      M: { totalDc: 1373, totalEc: 812, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 985, totalEc: 1200, maxDc: 25, maxEc: 30 },
      H: { totalDc: 745, totalEc: 1440, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 31,
    totalCodewordCount: 2323,
    counts: {
      L: { totalDc: 1843, totalEc: 480, maxDc: 116, maxEc: 30 },
      M: { totalDc: 1455, totalEc: 868, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1033, totalEc: 1290, maxDc: 25, maxEc: 30 },
      H: { totalDc: 793, totalEc: 1530, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 32,
    totalCodewordCount: 2465,
    counts: {
      L: { totalDc: 1955, totalEc: 510, maxDc: 115, maxEc: 30 },
      M: { totalDc: 1541, totalEc: 924, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1115, totalEc: 1350, maxDc: 25, maxEc: 30 },
      H: { totalDc: 845, totalEc: 1620, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 33,
    totalCodewordCount: 2611,
    counts: {
      L: { totalDc: 2071, totalEc: 540, maxDc: 116, maxEc: 30 },
      M: { totalDc: 1631, totalEc: 980, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1171, totalEc: 1440, maxDc: 25, maxEc: 30 },
      H: { totalDc: 901, totalEc: 1710, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 34,
    totalCodewordCount: 2761,
    counts: {
      L: { totalDc: 2191, totalEc: 570, maxDc: 116, maxEc: 30 },
      M: { totalDc: 1725, totalEc: 1036, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1231, totalEc: 1530, maxDc: 25, maxEc: 30 },
      H: { totalDc: 961, totalEc: 1800, maxDc: 17, maxEc: 30 }
    }
  },
  {
    version: 35,
    totalCodewordCount: 2876,
    counts: {
      L: { totalDc: 2306, totalEc: 570, maxDc: 122, maxEc: 30 },
      M: { totalDc: 1812, totalEc: 1064, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 1286, totalEc: 1590, maxDc: 25, maxEc: 30 },
      H: { totalDc: 986, totalEc: 1890, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 36,
    totalCodewordCount: 3034,
    counts: {
      L: { totalDc: 2434, totalEc: 600, maxDc: 122, maxEc: 30 },
      M: { totalDc: 1914, totalEc: 1120, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 1354, totalEc: 1680, maxDc: 25, maxEc: 30 },
      H: { totalDc: 1054, totalEc: 1980, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 37,
    totalCodewordCount: 3196,
    counts: {
      L: { totalDc: 2566, totalEc: 630, maxDc: 123, maxEc: 30 },
      M: { totalDc: 1992, totalEc: 1204, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1426, totalEc: 1770, maxDc: 25, maxEc: 30 },
      H: { totalDc: 1096, totalEc: 2100, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 38,
    totalCodewordCount: 3362,
    counts: {
      L: { totalDc: 2702, totalEc: 660, maxDc: 123, maxEc: 30 },
      M: { totalDc: 2102, totalEc: 1260, maxDc: 47, maxEc: 28 },
      Q: { totalDc: 1502, totalEc: 1860, maxDc: 25, maxEc: 30 },
      H: { totalDc: 1142, totalEc: 2220, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 39,
    totalCodewordCount: 3532,
    counts: {
      L: { totalDc: 2812, totalEc: 720, maxDc: 118, maxEc: 30 },
      M: { totalDc: 2216, totalEc: 1316, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 1582, totalEc: 1950, maxDc: 25, maxEc: 30 },
      H: { totalDc: 1222, totalEc: 2310, maxDc: 16, maxEc: 30 }
    }
  },
  {
    version: 40,
    totalCodewordCount: 3706,
    counts: {
      L: { totalDc: 2956, totalEc: 750, maxDc: 119, maxEc: 30 },
      M: { totalDc: 2334, totalEc: 1372, maxDc: 48, maxEc: 28 },
      Q: { totalDc: 1666, totalEc: 2040, maxDc: 25, maxEc: 30 },
      H: { totalDc: 1276, totalEc: 2430, maxDc: 16, maxEc: 30 }
    }
  },
]

const ECLevels = 'LMQH'.split('').map(fromString)

test('Error correction block - ECBlocksInfo is the same instance if equal (a.k.a. is memoized) ', ({ expect }) => {
  const checks = ECCharacteristics.map((versionChar) => ECLevels.map(level => ECBlocksInfo(versionChar.version, level.bit) === ECBlocksInfo(versionChar.version, level.bit)))
  const expeced = ECCharacteristics.map(() => [true, true, true, true])
  expect(checks).toEqual(expeced)
})


test('Error correction block - ECBlocksInfo error correction codewords and data codewords counts are valid', ({ expect }) => {
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



test('Error correction block - all blocks have the same valid number of codewords in a version', ({ expect }) => {
  const checks = ECCharacteristics.map((versionChar) => ECLevels.map(level => ECBlocksInfo(versionChar.version, level.bit).totalCount))
  const expeced = ECCharacteristics.map((versionChar) => new Array(4).fill(versionChar.totalCodewordCount))
  expect(checks).toEqual(expeced)
})


