import { QrCode } from './qr-code'
import { createSvgTag } from '../src/render/svg.render.js'
import { isValid } from './utils/qr-rs-correction-level.constants.js'

export class QRCodeElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    observer.observe(this, observerOptions)
  }

  connectedCallback () {
    applyQrCode(this)
  }

  get errorCorrectionLevel () {
    const errorCorrectionLevelAttr = this.getAttribute('data-error-correction-level')
    return errorCorrectionLevelAttr && isValid(errorCorrectionLevelAttr) ? errorCorrectionLevelAttr : 'Medium'
  }
}

/** @type {MutationObserverInit} */
const observerOptions = {
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  attributes: true,
  subtree: true,
}
const observer = new MutationObserver((records) => {
  const updatedNodes = new Set()
  for (const record of records) {
    const { target } = record
    if (target instanceof QRCodeElement) {
      updatedNodes.add(target)
    } else if (target.nodeType === Node.TEXT_NODE && target.parentElement instanceof QRCodeElement) {
      updatedNodes.add(target.parentElement)
    }
  }
  updatedNodes.forEach(el => el instanceof QRCodeElement && applyQrCode(el))
})

/**
 * @param {QRCodeElement} element - target QRCodeElement component element
 */
function applyQrCode (element) {
  const typeNumber = 0

  const { shadowRoot } = element
  if (!shadowRoot) {
    return
  }

  const { textContent } = element
  if (!textContent) {
    return
  }

  const qr = new QrCode(typeNumber, element.errorCorrectionLevel)
  qr.addData(textContent)
  qr.make()

  const svg = createSvgTag({ qrcode: qr })
  shadowRoot.innerHTML = svg
}
