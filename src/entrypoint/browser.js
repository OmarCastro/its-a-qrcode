import { QRCodeElement as Element } from '../its-a-qr-code.element.js'
export { QrCode } from '../qr-code.js'

const url = new URL(import.meta.url)
const elementName = url.searchParams.get('named')
if (elementName) {
  if (customElements.get(elementName) != null) {
    console.error(`A custom element with name "${elementName}" already exists`)
  } else {
    customElements.define(elementName, Element)
  }
}

export const QRCodeElement = Element
export default QRCodeElement
