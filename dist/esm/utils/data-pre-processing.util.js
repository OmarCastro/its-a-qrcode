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
 * @returns {{ level: number, isBlankLine: boolean }} indentation information
 */
function getLineIndentation (lineStr) {
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
 * @returns {string} QR code data with all lines unindented
 */
const dedent = (data) => {
  const lines = data.split('\n')
  const indentationsByLine = lines.map(getLineIndentation)
  const indentationsLevelsToCheck = indentationsByLine
    .filter(({ isBlankLine }) => !isBlankLine)
    .map(({ level }) => level)
  if (indentationsLevelsToCheck.length <= 0 || Math.min(...indentationsLevelsToCheck) === 0) {
    return data
  }
  const minIndentation = Math.min(...indentationsLevelsToCheck)
  const unindentedLines = lines.map((line, lineNumber) => line.slice(Math.max(0, Math.min(indentationsByLine[lineNumber].level, minIndentation))))
  return unindentedLines.join('\n')
}

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with all lines unindented
 */
const dedentFromFirstLine = (data) => {
  const lines = data.split('\n')
  const indentationsByLine = lines.map(getLineIndentation)
  const firstNonBlankLineIndentation = indentationsByLine.find(({ isBlankLine }) => !isBlankLine)
  if (!firstNonBlankLineIndentation) {
    return data
  }
  const charAmountToDedent = firstNonBlankLineIndentation.level
  const unindentedLines = lines.map((line, lineNumber) => line.slice(Math.max(0, Math.min(indentationsByLine[lineNumber].level, charAmountToDedent))))
  return unindentedLines.join('\n')
}

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data with trimmed lines
 */
const removeEmptyLines = (data) => data.split('\n').filter(line => line !== '').join('\n')

/**
 * @param {string} data - QR code data
 * @returns {string} QR code data without blank lines
 */
const removeBlankLines = (data) => data.split('\n').filter(line => line.trim() !== '').join('\n')

/**
 * @param {string} data - QR code data
 * @returns {string} vcard handled data
 */
const vcard = (data) => {
  const unwrappedTextData = removeBlankLines(dedentFromFirstLine(data))
  /*
    > Content lines SHOULD be folded to a maximum width of 75 octets, excluding the line
    > break.  Multi-octet characters MUST remain contiguous

    https://www.rfc-editor.org/rfc/rfc6350#section-3.2
  */
  let lineWidth = 0
  let wrappedTextData = ''
  for (const char of unwrappedTextData) {
    if (char === '\n') {
      wrappedTextData += char
      lineWidth = 0
      continue
    }
    if (lineWidth >= 75) {
      wrappedTextData += '\n '
      lineWidth = 1
    }

    wrappedTextData += char
    lineWidth++
  }
  return useCrflLineBreak(wrappedTextData)
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
  'no-empty-line': removeEmptyLines,
  'no-empty-lines': removeEmptyLines,
  'no-blank-line': removeBlankLines,
  'no-blank-lines': removeBlankLines,
  vcard,
  vevent,
}

/**
 * @param {string} data - QR code element text content
 * @returns {string[]} processed data
 */
function getPreprocessesFromContent (data) {
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
 * @param {string} data - QR code element text content to use `getPreprocessesFromContent` if invalid
 * @returns {string[]} processed data
 */
function getPreprocessesFromAttribute (preprocessAttr, data) {
  const splitData = preprocessAttr.split(' ')
    .map(name => name.toLowerCase())
    .filter(name => Object.hasOwn(preProcessMap, name))

  if (splitData.length === 0) {
    return getPreprocessesFromContent(data)
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
  const preprocesses = preprocessAttr ? getPreprocessesFromAttribute(preprocessAttr, data) : getPreprocessesFromContent(data)
  return preprocesses.reduce((acc, name) => preProcessMap[name](acc), data)
}
