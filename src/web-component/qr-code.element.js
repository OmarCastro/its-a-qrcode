/** @import { QrCode } from '../qr-code.js' */
/** @type {WeakMap<QRCodeElement, {qrcode?: QrCode, content: string[] | null}>} */
const qrCodeData = new WeakMap()
const EC_LEVEL_ATTR = 'data-error-correction-level'

export class QRCodeElement extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    import('./qr-code.async-loader.js').then(({ loadStyles }) => {
      shadowRoot.adoptedStyleSheets = [loadStyles()]
    })

    const span = this.ownerDocument.createElement('span')
    span.classList.add('container')
    span.addEventListener('transitionstart', () => {
      applyQrCode(this)
    })
    shadowRoot.append(span)
    observer.observe(this, observerOptions)
  }

  static async loadJsAPI () {
    return await import('./qr-code.async-loader.js')
  }

  connectedCallback () {
    applyQrCode(this)
  }

  get qrCodeContent () {
    const content = qrCodeData.get(this)?.content ?? null
    return content && content.length === 1 ? content[0] : content
  }

  get errorCorrectionLevel () {
    const errorCorrectionLevelAttr = this.getAttribute(EC_LEVEL_ATTR)
    return errorCorrectionLevelAttr && isValidECLevel(errorCorrectionLevelAttr) ? errorCorrectionLevelAttr : 'Medium'
  }

  set errorCorrectionLevel (errorCorrectionLevel) {
    if (isValidECLevel(errorCorrectionLevel)) {
      this.setAttribute(EC_LEVEL_ATTR, errorCorrectionLevel)
    }
  }
}

/** @type {MutationObserverInit} */
const observerOptions = {
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  attributes: true,
  attributeFilter: [EC_LEVEL_ATTR, 'data-whitespace'],
  subtree: true,
}
const observer = new MutationObserver(records => {
  const updatedNodes = new Set()
  for (const record of records) {
    const { target } = record
    if (target instanceof QRCodeElement) {
      updatedNodes.add(target)
    } else if (target.nodeType === Node.TEXT_NODE) {
      const { parentElement } = target
      if (parentElement instanceof QRCodeElement) {
        updatedNodes.add(target.parentElement)
      }
      if (parentElement instanceof HTMLDataElement && parentElement.parentElement instanceof QRCodeElement) {
        updatedNodes.add(parentElement.parentElement)
      }
    } else if (target instanceof HTMLDataElement && target.parentElement instanceof QRCodeElement) {
      updatedNodes.add(target.parentElement)
    }
  }
  updatedNodes.forEach(el => el instanceof QRCodeElement && applyQrCode(el))
})

/**
 * @param {QRCodeElement} element - target QRCodeElement component element
 */
async function applyQrCode (element) {
  const { QrCode, parseQrCodeColorsFromElement, parseQrCodeStylesFromElement, createSvgTag, createImgTag, queryQrContentFromElement } = await import('./qr-code.async-loader.js')
  const typeNumber = 0

  const { shadowRoot } = element
  if (!shadowRoot) {
    return
  }

  const oldQr = qrCodeData.get(element)?.qrcode
  const qrCodeContent = queryQrContentFromElement(element)
  const newQrCodeData = {
    qrcode: oldQr,
    content: qrCodeContent
  }
  qrCodeData.set(element, newQrCodeData)
  if (!qrCodeContent) {
    Object.freeze(newQrCodeData)
    return
  }
  const qr = new QrCode(typeNumber, element.errorCorrectionLevel)
  for (const content of qrCodeContent) {
    qr.addData(content)
  }
  qr.make()
  newQrCodeData.qrcode = qr
  Object.freeze(newQrCodeData)

  const colors = parseQrCodeColorsFromElement(element)
  const style = parseQrCodeStylesFromElement(element)
  const marginComputedStyle = getComputedStyle(element).getPropertyValue('--qrcode-margin').trim()
  const cellSize = 2
  const margin = /^\d+$/.test(marginComputedStyle) ? +marginComputedStyle * cellSize : undefined

  const renderMode = getRenderMode(element)
  if (renderMode === 'svg') {
    const svg = createSvgTag({ qrcode: qr, colors, cellSize, margin, scalable: isResizeEnabled(element), style })
    shadowRoot.children[0].innerHTML = svg
    return
  }

  const imgHtml = createImgTag({ qrcode: qr, colors, cellSize, margin, style })
  const oldImgElement = shadowRoot.querySelector('img')
  if (oldImgElement) {
    const updated = updateImgElement(oldImgElement, imgHtml)
    if (!updated) {
      shadowRoot.children[0].innerHTML = imgHtml
    }
  } else {
    shadowRoot.children[0].innerHTML = imgHtml
  }

  if (oldQr && (oldQr.dataList.length !== qr.dataList.length || oldQr.dataList.some((val, index) => val.data !== qr.dataList[index].data))) {
    const customEvent = new CustomEvent('qrcode-content-change', { detail: { previousQRCode: oldQr, qrCode: qr } })
    element.dispatchEvent(customEvent)
  }
}

const correctionLevelNames = new Set(['Medium', 'Low', 'High', 'Quartile'].flatMap(ec => [ec.toUpperCase(), ec[0]]))
/**
 * @param {string} ecLevel - Error correction level to validate
 */
function isValidECLevel (ecLevel) {
  return correctionLevelNames.has(ecLevel.toUpperCase())
}

/**
 * Updates the image element.
 *
 * Replacing the element with another &lt;img> will make the image flash and re-render twice,
 * one for the updated HTML without the previous image, as it is loading, and another time with the loaded image, this
 * will make it update once without making it flash
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
  if (renderModeCss === 'svg') { return 'svg' }
  if (renderModeCss === 'raster') { return 'raster' }
  if (isResizeEnabled(element)) { return 'svg' }
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
