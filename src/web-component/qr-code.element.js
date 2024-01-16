import { QrCode } from '../qr-code.js'
import { createImgTag } from '../render/img-tag.render.js'
import { createSvgTag } from '../render/svg.render.js'
import { isValid } from '../error-correction/ec-level.js'
import { preProcess } from '../utils/data-pre-processing.util.js'
import { parseQrCodeColorsFromElement } from '../utils/css-colors.util.js'
import css from './qr-code.element.css'

let loadStyles = () => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(css)
  loadStyles = () => sheet
  return sheet
}
/** @type {WeakMap<QRCodeElement, QrCode>} */
const qrCodeData = new WeakMap()

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

  get qrCodeContent () {
    const { textContent } = this
    return textContent ? preProcess(textContent, this.getAttribute('data-whitespace') || '') : textContent
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

  const { qrCodeContent } = element
  if (!qrCodeContent) {
    return
  }

  const oldQr = qrCodeData.get(element)
  const qr = new QrCode(typeNumber, element.errorCorrectionLevel)
  qr.addData(qrCodeContent)
  qr.make()
  qrCodeData.set(element, qr)

  const colors = parseQrCodeColorsFromElement(element)

  const renderMode = getRenderMode(element)
  if (renderMode === 'svg') {
    const svg = createSvgTag({ qrcode: qr, darkColor: colors.darkColor, lightColor: colors.lightColor, scalable: isResizeEnabled(element) })
    shadowRoot.innerHTML = svg
    return
  }

  const imgHtml = createImgTag({ qrcode: qr, darkColor: colors.darkColor, lightColor: colors.lightColor })
  const oldImgElement = shadowRoot.querySelector('img')
  if (oldImgElement) {
    const updated = updateImgElement(oldImgElement, imgHtml)
    if (!updated) {
      shadowRoot.innerHTML = imgHtml
    }
  } else {
    shadowRoot.innerHTML = imgHtml
  }

  if (oldQr && (oldQr.dataList.length !== qr.dataList.length || oldQr.dataList.some((val, index) => val.data !== qr.dataList[index].data))) {
    const customEvent = new CustomEvent('qrcode-content-change', { detail: { previousQRCode: oldQr, qrCode: qr } })
    element.dispatchEvent(customEvent)
  }
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

/**
 * Gets the render mode to be used:
 *  - if mode is "raster", it will render the qrcode as an rasterized image
 *  - if mode is "svg", it will render the qrcode as a scalable image using SVG
 * @param {QRCodeElement} element - target qr code element
 * @returns {"raster"|"svg"} render mode
 */
function getRenderMode (element) {
  const renderModeCss = (getComputedStyle(element).getPropertyValue('--qrcode-render') || '').trim().toLowerCase()
  if (renderModeCss === 'svg') return 'svg'
  if (renderModeCss === 'raster') return 'raster'
  if (isResizeEnabled(element)) return 'svg'
  return 'raster'
}

/**
 * @param {QRCodeElement} element - target qr code element
 * @returns {boolean} true if resize enabled
 */
function isResizeEnabled (element) {
  const resizeCss = (getComputedStyle(element).getPropertyValue('--qrcode-resize') || '').trim().toLowerCase()
  return resizeCss === 'true' || resizeCss === 'yes' || resizeCss === 'enabled' || resizeCss === 'enable'
}
