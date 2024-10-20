/**
 * Calculate the row/column coordinates of the center module of each alignment pattern
 * for the specified QR Code version.
 *
 * The alignment patterns are positioned symmetrically on either side of the diagonal
 * running from the top left corner of the symbol to the bottom right corner.
 *
 * Since positions are symmetrical only half of the coordinates are returned.
 * Each item of the array will represent in turn the x and y coordinate.
 * @see {@link getPositions}
 * @param  {number} version - QR Code version
 * @returns {number[]} Array of coordinate
 */
export function calculateCoordinates (version) {
  if (version === 1) return []
  const intervals = Math.floor(version / 7) + 1
  const distance = 4 * version + 4 // between first and last pattern
  const step = version === 32 ? 26 : Math.ceil(distance / intervals / 2) * 2
  return [6, ...Array.from({ length: intervals }, (_, index) => distance + 6 - (intervals - 1 - index) * step)]
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
const positionsMemo = []

/**
 * Returns an array containing the positions of each alignment pattern.
 * Each array's element represent the center point of the pattern as (x, y) coordinates
 * @param {number} version - QR code version
 * @returns {PatternPositions} list of pattern positions
 */
export function getPatternPositions (version) {
  if (!Number.isInteger(version) || version < 1 || version > 40) {
    throw Error(`invalid pattern @ version:${version}'`)
  }
  // eslint-disable-next-line sonarjs/no-empty-collection -- its a nullish coalesce assignment, it is expected
  return (positionsMemo[version - 1] ??= calculatePositions(version))
}

/**
 * @typedef {readonly [number, number]} Point
 */

/**
 * @typedef {readonly Point[]} PatternPositions
 */
