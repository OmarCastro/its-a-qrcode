/**
 * Escapes the `xml` string
 * @param {string} xml - xml to escape
 */
export function escapeXml(xml) {
    var escaped = '';
    for (let i = 0, e = xml.length; i < e; i += 1) {
        const c = xml.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
    }
    return escaped;
};
