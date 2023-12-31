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
 * @param {string} data - QR code data
 * @returns {string} QR code data with trimmed lines
 */
const removeEmptylines = (data) => data.split('\n').filter(line => line !== '').join('\n')

/**
 * @param {string} data - QR code data
 * @returns {string} vcard handled data
 */
const vcard = (data) => removeEmptylines(trimLines(data))

/**
 * @type {{[name:string]: (data: string) => string}}
 */
const preProcessMap = {
  none,
  trim,
  'trim-lines': trimLines,
  vcard,
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
