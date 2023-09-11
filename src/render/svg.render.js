import { escapeXml } from "../utils/escape-xml.util.js";

/**
 * 
 * @param {object} opts 
 * @param {number} [opts.cellSize]
 * @param {number} [opts.margin]
 * @param {string|SvgAttr} [opts.alt]
 * @param {string|SvgAttr} [opts.title]
 * @param {boolean} [opts.scalable]
 * @param {import('../qr-code.js').QrCode} opts.qrcode 
 * @returns {string} &lt;svg> element outer HTML
 */
export function createSvgTag({cellSize, margin, alt, title, qrcode, scalable}) {
    const {moduleCount} = qrcode


    cellSize = cellSize || 2;
    margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

    // Compose alt property surrogate

    /** @type {SvgAttr} */
    alt = (typeof alt === 'string') ? {text: alt} : alt || {text: ''};
    alt.text ||= '';
    alt.id ||= 'qrcode-description';

    // Compose title property surrogate
    title = (typeof title === 'string') ? {text: title} : title || {text: ''};
    title.text = title.text || '';
    title.id = title.id || 'qrcode-title';

    const size = moduleCount * cellSize + margin * 2;
    const rect = 'l' + cellSize + ',0 0,' + cellSize + ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

    let qrSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
    qrSvg += !scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
    qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
    qrSvg += ' preserveAspectRatio="xMinYMin meet"';
    qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '' + '>';
    qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + '</title>' : '';
    qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + '</description>' : '';
    qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
    qrSvg += '<path d="';

    for (let r = 0; r < moduleCount; r += 1) {
      let mr = r * cellSize + margin;
      for (let c = 0; c < moduleCount; c += 1) {
        if (qrcode.isDark(r, c) ) {
          let mc = c*cellSize+margin;
          qrSvg += 'M' + mc + ',' + mr + rect;
        }
      }
    }

    qrSvg += '" stroke="transparent" fill="black"/>';
    qrSvg += '</svg>';

    return qrSvg;
};

/**
 * @typedef {object} SvgAttr
 * @property {string} text
 * @property {string} [id]
 */

