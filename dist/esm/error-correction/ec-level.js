export const CORRECTION_LEVEL_L = 1
export const CORRECTION_LEVEL_M = 0
export const CORRECTION_LEVEL_Q = 3
export const CORRECTION_LEVEL_H = 2

const correctionLevelNames = ['Medium', 'Low', 'Quartile', 'High']

/** @type {Record<string, { bit: number, name: string }>} */
const correctionLevelMap = correctionLevelNames.reduce((acc, name, bit) => {
  const result = { bit, name }
  return { ...acc, [name.toUpperCase()]: result, [name[0]]: result }
}, {})

const validKeys = correctionLevelNames.flatMap(name => [name, name[0]])
/**
 * Get error correction level from string
 * @param {string} string - correction level text
 * @throws error on invalid correction level
 * @returns {{ bit: number }} correction level object
 */
export function fromString (string) {
  if (typeof string !== 'string') {
    throw new Error(`expected string instead of ${typeof string}`)
  }

  const result = correctionLevelMap[string.toUpperCase()]
  if (!result) {
    throw new Error(`Unknown Error Correction Level: ${string} expected one of the following values (case insensitive): ${validKeys}`)
  }
  return result
}

/**
 * Checks if error correction level is valid.
 *
 * Error corection is valid if `string` is one of the following values (case insensitive): `L`,`Low`,`M`,`Medium`,`Q`,`Quartile`,`H` and `High`
 * @param {string} string - target string
 * @returns {boolean} true if correction level is valid, false otherwise
 */
export function isValid (string) {
  if (typeof string !== 'string') {
    return false
  }
  return Object.hasOwn(correctionLevelMap, string.toUpperCase())
}
