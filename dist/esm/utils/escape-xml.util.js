/** @type {{[key: string]: string}} */
const xmlEscapeMap = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}

/**
 * Escapes XML entities characters in `xml` string
 * @param {string} xml - xml to escape
 * @returns {string} escaped xml
 */
export function escapeXml (xml) {
  return xml.replace(/[<>&'"]/g, c => xmlEscapeMap[c])
};
