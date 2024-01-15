/**
 * @param {string} data - QR code data
 * @returns {string} unprocessed data
 */
const none = (data) => data

/**
 * @param {string} data - QR code data
 * @returns {string} trimmed QR code data
 */
const trim = (data) => data.trim()

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with trimmed lines
 */
const trimLines = (data) => data.split('\n').map(line => line.trim()).join('\n')

/**
 * @param {string} lineStr - line content
 * @returns {{ level: number, isBlankLine: boolean }} identation information
 */
function getLineIdentation (lineStr) {
  const { length } = lineStr
  for (let level = 0; level < length; level++) {
    if (lineStr.charAt(level).trim() !== '') {
      return { level, isBlankLine: false }
    }
  }
  return { level: length, isBlankLine: true }
}

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with all lines dedented
 */
const dedent = (data) => {
  const lines = data.split('\n')
  const identationsByLine = lines.map(getLineIdentation)
  const identationsLevelsToCheck = identationsByLine
    .filter(({ isBlankLine }) => !isBlankLine)
    .map(({ level }) => level)
  if (identationsLevelsToCheck.length <= 0 || Math.min(...identationsLevelsToCheck) === 0) {
    return data
  }
  const minIdentation = Math.min(...identationsLevelsToCheck)
  const detentedLines = lines.map((line, lineNumber) => line.substring(Math.min(identationsByLine[lineNumber].level, minIdentation)))
  return detentedLines.join('\n')
}

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with all lines dedented
 */
const dedentFromFirstLine = (data) => {
  const lines = data.split('\n')
  const identationsByLine = lines.map(getLineIdentation)
  const firstNonBlankLineIdentation = identationsByLine.find(({ isBlankLine }) => !isBlankLine)
  if (!firstNonBlankLineIdentation) {
    return data
  }
  const charAmountToDedent = firstNonBlankLineIdentation.level
  const detentedLines = lines.map((line, lineNumber) => line.substring(Math.min(identationsByLine[lineNumber].level, charAmountToDedent)))
  return detentedLines.join('\n')
}

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with trimmed lines
 */
const removeEmptylines = (data) => data.split('\n').filter(line => line !== '').join('\n')

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data without blank lines
 */
const removeBlanklines = (data) => data.split('\n').filter(line => line.trim() !== '').join('\n')

/**
 * @param {string} data - QR code data
 * @returns {string} vcard handled data
 */
const vcard = (data) => {
  const unwrapedTextData = removeBlanklines(dedentFromFirstLine(data))
  /*
    > Content lines SHOULD be folded to a maximum width of 75 octets, excluding the line
    > break.  Multi-octet characters MUST remain contiguous

    https://www.rfc-editor.org/rfc/rfc6350#section-3.2
  */
  let lineWidth = 0
  let wrapedTextData = ''
  for (const char of unwrapedTextData) {
    if (char === '\n') {
      wrapedTextData += char
      lineWidth = 0
      continue
    }
    if (lineWidth >= 75) {
      wrapedTextData += '\n '
      lineWidth = 1
    }

    wrapedTextData += char
    lineWidth++
  }
  return useCrflLineBreak(wrapedTextData)
}

/**
 * @param {string} data - QR code data
 * @returns {string} vevent handled data
 */
const vevent = (data) => {
  /*
    VEVENT is similar to VCARD

    https://www.rfc-editor.org/rfc/rfc5545
  */
  return vcard(data)
}

/**
 * @param {string} data - QR code data
 * @returns {string} data with newlines converted to CRFL (\r\n)
 */
const useCrflLineBreak = (data) => data.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n')

/**
 * @type {{[name:string]: (data: string) => string}}
 */
const preProcessMap = {
  none,
  pre: none,
  trim,
  dedent,
  'dedent-from-first-line': dedentFromFirstLine,
  'trim-line': trimLines,
  'trim-lines': trimLines,
  'no-empty-line': removeEmptylines,
  'no-empty-lines': removeEmptylines,
  'no-blank-line': removeBlanklines,
  'no-blank-lines': removeBlanklines,
  vcard,
  vevent,
}

/**
 * @param {string} data - QR code element text content
 * @returns {string[]} processed data
 */
function getPreproccessesFromContent (data) {
  const trimmedData = trim(data)
  if (/^BEGIN:[vV][cC][aA][rR][dD]/.test(trimmedData)) {
    return ['vcard']
  }
  if (/^BEGIN:[vV][eE][vV][eE][nN][tT]/.test(trimmedData)) {
    return ['vevent']
  }
  return ['trim']
}

/**
 * @param {string} preprocessAttr - QR code data-pre-process attribute
 * @param {string} data - QR code element text content to use `getPreproccessesFromContent` if invalid
 * @returns {string[]} processed data
 */
function getPreproccessesFromAttribute (preprocessAttr, data) {
  const splitData = preprocessAttr.split(' ')
    .map(name => name.toLowerCase())
    .filter(name => Object.hasOwn(preProcessMap, name))

  if (splitData.length === 0) {
    return getPreproccessesFromContent(data)
  }
  return splitData
}

/**
 * Process QR code element text element before transforming to QRCode
 * @param {string} data - QR code element text content
 * @param {string} [preprocessAttr] - QR code data-pre-process attribute
 * @returns {string} processed data
 */
export function preProcess (data, preprocessAttr) {
  const preprocesses = preprocessAttr ? getPreproccessesFromAttribute(preprocessAttr, data) : getPreproccessesFromContent(data)
  return preprocesses.reduce((acc, name) => preProcessMap[name](acc), data)
}
