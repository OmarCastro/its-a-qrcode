export { QrCode } from '../qr-code.js'
export { createImgTag } from '../render/img-tag.render.js'
export { createSvgTag } from '../render/svg.render.js'
export { isValid } from '../error-correction/ec-level.js'
export { parseQrCodeColorsFromElement } from '../utils/css-colors.util.js'
export { parseQrCodeStylesFromElement } from '../utils/css-qrcode-style.util.js'
import css from './qr-code.element.css'

let styleSheetLoad = () => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  styleSheetLoad = () => sheet
  return sheet
}

export const loadStyles = () => styleSheetLoad()
