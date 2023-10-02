import { QrCode } from './qr-code'
import { createSvgTag } from '../src/render/svg.render.js'

export class QRCodeElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    observer.observe(this, observerOptions)
  }

  connectedCallback () {
    applyQrCode(this)
  }
}

/** @type {MutationObserverInit} */
const observerOptions = {
  characterData: true,
  characterDataOldValue: true,
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
 *
 * @param {HTMLElement} element
 */
function applyQrCode (element) {
  const typeNumber = 0
  const errorCorrectionLevel = null

  const { shadowRoot } = element
  if (!shadowRoot) {
    return
  }

  const { textContent } = element
  if (!textContent) {
    return
  }

  const qr = new QrCode(typeNumber || 4, errorCorrectionLevel || 'M')
  qr.addData(textContent, 'Byte')
  qr.make()

  shadowRoot.innerHTML = createSvgTag({ qrcode: qr })
}
