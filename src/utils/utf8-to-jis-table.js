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
  for (const [jisChar, compressedUtf8ValsStr] of Object.entries(compressedTable)) {
    const utf8Vals = decompressUtf8ValsStr(compressedUtf8ValsStr).split(',')
    let charIterator = xInt(jisChar)
    for (const utf8Value of utf8Vals) {
      if (utf8Value.includes('|')) {
        utf8Value.split('|').map(b64Int).forEach(key => { result[key] = charIterator })
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

/**
 * decompress each value in utf8-to-jis-table.constants.js object (e.g "4[p[S[A,C,M,Q,Y,U,c,s,k,0,8,B,D,P,T,b,X,j,z,r,7],WL,S[g,v,o,3,/,d,w,l,4],WC]]" to
 * "4pSA,4pSC,4pSM,4pSQ,4pSY,4pSU,4pSc,4pSs,4pSk,4pS0,4pS8,4pSB,4pSD,4pSP,4pST,4pSb,4pSX,4pSj,4pSz,4pSr,4pS7,4pWL,4pSg,4pSv,4pSo,4pS3,4pS/,4pSd,4pSw,4pSl,4pS4,4pWC")
 * @param {string} compressedVals - compressed utf8-to-jis-table.constants.js field value
 */
function decompressUtf8ValsStr (compressedVals) {
  /** @type {(str: string, amount: number) => string} */
  const join = (str, amount) => str.slice(1, -1).split('').reduce((val, ch, i) => val + (i % amount ? '' : ',') + ch)
  /** @type {(match: string) => string} */
  const joinGroup = match => match.slice(0, -1).split('').reduce((acc, ch) => acc + ch + '[')

  const commaSeparatedVals = compressedVals
    .replace(/_[^_]+_/g, match => join(match, 3))
    .replace(/#[^#]+#/g, match => join(match, 2))
    .replace(/;[^;]+;/g, match => join(match, 1))
    .replace(/...\{/g, joinGroup)
    .replace(/..\(/g, joinGroup)
    .replace(/}/g, ']]]')
    .replace(/\)/g, ']]')
  let result = ''
  let prefix = ''
  let initPrefix = ''
  for (const char of commaSeparatedVals) {
    switch (char) {
      case '[':
        initPrefix = prefix
        break
      case ']':
        initPrefix = initPrefix.slice(0, -1)
        break
      case ',':
        result += prefix + ','
        prefix = initPrefix
        break
      default:
        prefix += char
    }
  }
  result += prefix
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
