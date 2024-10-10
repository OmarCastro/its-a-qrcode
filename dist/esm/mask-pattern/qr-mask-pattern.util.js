/*
 mask patterns

  Mask 000    Mask 001    Mask 010    Mask 011
   ______      ______      ______      ______
  ▕▀▄▀▄▀▄⎸    ▕▀▀▀▀▀▀⎸    ▕█  █  ⎸    ▕▀ ▄▀ ▄⎸
  ▕▀▄▀▄▀▄⎸    ▕▀▀▀▀▀▀⎸    ▕█  █  ⎸    ▕▄▀ ▄▀ ⎸
  ▕▀▄▀▄▀▄⎸    ▕▀▀▀▀▀▀⎸    ▕█  █  ⎸    ▕ ▄▀ ▄▀⎸
   ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺

  Mask 100    Mask 101    Mask 110    Mask 111
   ______      ______      ______      ______
  ▕███   ⎸    ▕█▀▀▀▀▀⎸    ▕███▀▀▀⎸    ▕▀ ▀▄█▄⎸
  ▕   ███⎸    ▕█ ▄▀▄ ⎸    ▕█▀▄▀█ ⎸    ▕▀▄ ▄▀█⎸
  ▕███   ⎸    ▕█  ▀  ⎸    ▕█ ▀▀▄█⎸    ▕ ██▄  ⎸
   ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺      ⎺⎺⎺⎺⎺⎺
*/

/** @type {MaskPatternFunction[]} */
const maskPatternFunctions = [
  (i, j) => (i + j) % 2 === 0, // PATTERN000
  (i, _) => i % 2 === 0, // PATTERN001
  (_, j) => j % 3 === 0, // PATTERN010
  (i, j) => (i + j) % 3 === 0, // PATTERN011
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0, // PATTERN100
  (i, j) => (i * j) % 2 + (i * j) % 3 === 0, // PATTERN101
  (i, j) => ((i * j) % 2 + (i * j) % 3) % 2 === 0, // PATTERN110
  (i, j) => ((i * j) % 3 + (i + j) % 2) % 2 === 0, // PATTERN110
]

/**
 * @param {number} maskPattern - mask pattern, an integer number between 0 and 7
 * @returns {MaskPatternFunction} mask pattern function
 */
export function getMaskPatternFunction (maskPattern) {
  const result = maskPatternFunctions[maskPattern]
  if (!result) {
    throw Error(`bad maskPattern: ${maskPattern}`)
  }
  return result
};

/**
 * @callback MaskPatternFunction
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 * @returns {boolean} true to paint a black pixel, false to paint a white pixel
 */
