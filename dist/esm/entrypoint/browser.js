import { QRCodeElement as Element } from '../web-component/qr-code.element.js'
export { QrCode } from '../qr-code.js'
const url = new URL(import.meta.url)
const tagName = url.searchParams.get('named')?.trim()
tagName && customElements.define(tagName, Element)
export const QRCodeElement = Element
export default QRCodeElement
