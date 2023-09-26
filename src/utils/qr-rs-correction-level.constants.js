export const CORRECTION_LEVEL_L = 1
export const CORRECTION_LEVEL_M = 0
export const CORRECTION_LEVEL_Q = 3
export const CORRECTION_LEVEL_H = 2

const CorrectionLevel = {
  L: { bit: 1 },
  M: { bit: 0 },
  Q: { bit: 3 },
  H: { bit: 2 },
}

/** @type {Record<string, { bit: number }>} */
const correctionLevelMap = {
  l: CorrectionLevel.L,
  low: CorrectionLevel.L,

  m: CorrectionLevel.M,
  medium: CorrectionLevel.M,

  q: CorrectionLevel.Q,
  quartile: CorrectionLevel.Q,

  h: CorrectionLevel.H,
  high: CorrectionLevel.H,
}

/**
 *
 * @param {string} string
 * @returns
 */
export function fromString (string) {
  if (typeof string !== 'string') {
    throw new Error(`expected string instead of ${typeof string}`)
  }

  const result = correctionLevelMap[string.toLowerCase()]
  if (!result) {
    const validKeys = Object.keys(correctionLevelMap).map(key => `"${key}"`).join(',')
    throw new Error(`Unknown Error Correction Level: ${string} expected one of the following values (case insensitive): ${validKeys}`)
  }
  return result
}
