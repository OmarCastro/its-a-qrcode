import { createDataURL } from "./data-url.render.js";
import { escapeXml } from "../utils/escape-xml.util.js";

/**
 * 
 * @param {object} opts 
 * @param {number} opts.cellSize 
 * @param {number} opts.margin 
 * @param {string} opts.alt 
 * @param {import('../utils/qr-code.js').QrCode} opts.qrcode 
 */
export function createImgTag({cellSize, margin, alt, qrcode}) {
  cellSize ||= 2;
  margin ??= cellSize * 4;
  const size = qrcode.moduleCount * cellSize + margin * 2;
  const altAttr = alt ? `alt="${escapeXml(alt)}"`: ''    
  return `<img src="${createDataURL({cellSize, margin, qrcode})}" width="${size} height="${size} ${altAttr}/>`
};
