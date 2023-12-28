import { QrCode } from './qr-code'
import { createImgTag } from './render/img-tag.render'
import { createSvgTag } from './render/svg.render.js'
import { isValid } from './error-correction/ec-level.js'
import css from './its-a-qr-code.element.css'

let loadStyles = () => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  loadStyles = () => sheet
  return sheet
}

export class QRCodeElement extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.adoptedStyleSheets = [loadStyles()]
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

  const darkColor = getComputedStyle(element).getPropertyValue('--qrcode-dark-color') || 'black'
  const lightColor = getComputedStyle(element).getPropertyValue('--qrcode-light-color') || 'white'

  const renderMode = getComputedStyle(element).getPropertyValue('--qrcode-render')
  if (renderMode && renderMode.trim().toLowerCase() === 'svg') {
    const svg = createSvgTag({ qrcode: qr, darkColor, lightColor })
    shadowRoot.innerHTML = svg
    return
  }

  const imgHtml = createImgTag({ qrcode: qr, darkColor, lightColor })
  const oldImgElement = shadowRoot.querySelector('img')
  if (oldImgElement) {
    const updated = updateImgElement(oldImgElement, imgHtml)
    if (updated) {
      return
    }
  }
  shadowRoot.innerHTML = imgHtml
}

/**
 * Updates the image element, replacing the element with another &lt;img> will make the browser flash and re-render twice,
 * one for the updated HTML without the previous image, as it is loading, and another time with the loaded image, this
 * will make it update once without flash
 * @param {HTMLImageElement} imageElement - target &lt;img> element
 * @param {string} imgHtml img rendered with {@link createImgTag}
 * @returns {boolean} true if updated correctly, false if something failed. If false, applyQrCode() will fallback to replace the &lt;img>
 */
function updateImgElement (imageElement, imgHtml) {
  const imgDom = new DOMParser().parseFromString(imgHtml, 'text/html').querySelector('img')
  if (!imgDom) {
    return false
  }
  imageElement.src = imgDom.src
  imageElement.width = imgDom.width
  imageElement.height = imgDom.height
  return true
}
