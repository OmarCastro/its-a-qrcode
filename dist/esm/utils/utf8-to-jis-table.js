import { base64ToHex } from './text-decode-encode.util.js'
import UTF8_TO_JIS_TABLE from './utf8-to-jis-table.constants.js'

/** @param {string} x - hex string */
const xInt = x => parseInt(x, 16)
/** @param {string} x - base64 string */
const b64Int = x => xInt(base64ToHex(x))

/** @typedef {{[key: string]: string}} CompressedTable */
/** @typedef {{[utf8Value: number]: number}} Utf8ToJisTable */

/**
 * @param {CompressedTable} compressedTable - target table
 * @returns {Utf8ToJisTable} decompressed table
 */
function decompressUtf8ToJisTable (compressedTable) {
  /** @type {Record<number, number>} */
  const result = {}
  for (const [jisChar, utf8ValsStr] of Object.entries(compressedTable)) {
    const utf8Vals = utf8ValsStr.split(',')
    let charIterator = xInt(jisChar)
    for (const utf8Value of utf8Vals) {
      if (utf8Value.includes(':')) {
        utf8Value.split(':').map(b64Int).forEach(key => { result[key] = charIterator })
        charIterator++
      } else if (utf8Value.includes('>')) {
        const kv = utf8Value.split('>')
        const init = b64Int(kv[0])
        for (let i = 0, e = xInt(kv[1]); i <= e; ++i) {
          result[init + i] = charIterator++
        }
      } else {
        result[b64Int(utf8Value)] = charIterator++
      }
    }
  }
  return result
}

/** @type {(x:CompressedTable) => {Utf8ToJisTable: () => Utf8ToJisTable}} x  */
export const usingTable = (compressedTable) => {
  let generatedTable = null
  return {
    Utf8ToJisTable () {
      generatedTable ??= decompressUtf8ToJisTable(compressedTable)
      return generatedTable
    },
  }
}

export const getUtf8ToJisTable = usingTable(UTF8_TO_JIS_TABLE).Utf8ToJisTable
