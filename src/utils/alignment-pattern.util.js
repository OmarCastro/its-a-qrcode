/**
 * Calculate the row/column coordinates of the center module of each alignment pattern
 * for the specified QR Code version.
 *
 * The alignment patterns are positioned symmetrically on either side of the diagonal
 * running from the top left corner of the symbol to the bottom right corner.
 *
 * Since positions are simmetrical only half of the coordinates are returned.
 * Each item of the array will represent in turn the x and y coordinate.
 * @see {@link getPositions}
 * @param  {number} version - QR Code version
 * @returns {number[]} Array of coordinate
 */
export function calculateCoordinates (version) {
  if (version === 1) return []

  const positionCount = Math.floor(version / 7) + 2
  const moduleCount = version * 4 + 17

  const intervals = moduleCount === 145 ? 26 : Math.ceil((moduleCount - 13) / (2 * positionCount - 2)) * 2
  const positions = [moduleCount - 7] // Last coordinate is always (size - 7)

  for (let i = 1; i < positionCount - 1; i++) {
    positions[i] = positions[i - 1] - intervals
  }

  return [6, ...positions.reverse()] // First coordinate is always 6
}

/**
 * Returns an array containing the positions of each alignment pattern.
 * Each array's element represent the center point of the pattern as (x, y) coordinates
 *
 * Coordinates are calculated expanding the row/column coordinates returned by {@link calculateCoordinates}
 * and filtering out the items that overlaps with finder pattern
 * @param  {number} version - QR Code version
 * @returns {PatternPositions} list of pattern positions
 */
export function calculatePositions (version) {
  /** @type {Point[]} */
  const coords = []
  const pos = calculateCoordinates(version)
  const posLength = pos.length

  for (let i = 0; i < posLength; i++) {
    for (let j = 0; j < posLength; j++) {
      // Skip if position is occupied by finder patterns
      if ((i === 0 && j === 0) || // top-left
          (i === 0 && j === posLength - 1) || // bottom-left
          (i === posLength - 1 && j === 0)) { // top-right
        continue
      }

      coords.push(Object.freeze([pos[i], pos[j]]))
    }
  }

  return Object.freeze(coords)
}

/**
 * Used to memoize getPatternPosition calls
 * @type {PatternPositions[]}
 */
const positionsCache = []

/**
 * @param {number} version - QR code version
 * @returns {PatternPositions} pattern positions
 */
export function getPatternPositions (version) {
  if (!Number.isInteger(version) || version < 1 || version > 40) {
    throw Error(`invalid pattern @ version:${version}'`)
  }
  // eslint-disable-next-line sonarjs/no-empty-collection -- its a nullish coalesce assignment, it is expected
  return (positionsCache[version - 1] ??= calculatePositions(version))
}

/**
 * @typedef {readonly [number, number]} Point
 */

/**
 * @typedef {readonly Point[]} PatternPositions
 */
