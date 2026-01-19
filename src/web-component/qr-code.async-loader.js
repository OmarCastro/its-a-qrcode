import css from './qr-code.element.css'
import { registerCSSProperties, varObserverCSSRules } from '../utils/css.util.js'
export { QrCode } from '../qr-code.js'
export { createImgTag } from '../render/img-tag.render.js'
export { createSvgTag } from '../render/svg.render.js'
export { isValid } from '../error-correction/ec-level.js'
export { parseQrCodeColorsFromElement } from '../utils/css-colors.util.js'
export { parseQrCodeStylesFromElement } from '../utils/css-qrcode-style.util.js'

let styleSheetLoad = () => {
  registerCSSProperties()
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(`${css}
    
.container {
${varObserverCSSRules}
}`)
  styleSheetLoad = () => sheet
  return sheet
}

export const loadStyles = () => styleSheetLoad()
