/**
 * Escapes XML entities characters in `xml` string
 * @param {string} xml - xml to escape
 * @returns {string} escaped xml
 */
export function escapeXml (xml) {
  let escaped = ''
  for (let i = 0, e = xml.length; i < e; i += 1) {
    const c = xml.charAt(i)
    switch (c) {
      case '<': escaped += '&lt;'; break
      case '>': escaped += '&gt;'; break
      case '&': escaped += '&amp;'; break
      case '"': escaped += '&quot;'; break
      default : escaped += c; break
    }
  }
  return escaped
};
