import { QrCode } from "./qr-code";
import {createSvgTag} from '../src/render/svg.render.js'



export class QRCodeElement extends HTMLElement {
  
  constructor(){
    super()
    observer.observe(this, observerOptions)
  }
    
}

/** @type {MutationObserverInit} */
const observerOptions = {
  characterData: true, 
  characterDataOldValue: true,
  attributes: true
}
const observer = new MutationObserver((records) => {
  const updatedNodes = new Set(records.map(record => record.target))
  updatedNodes.forEach(el => el instanceof QRCodeElement && applyQrCode(el))
})



/**
 * 
 * @param {HTMLElement} element 
 */
function applyQrCode(element){
  const typeNumber = 0
  const errorCorrectionLevel = null

  const {textContent} = element
  if(!textContent){
    return
  }

  const qr = new QrCode(typeNumber || 4, errorCorrectionLevel || 'M');
  qr.addData(textContent, "Byte");
  qr.make();

  element.innerHTML = createSvgTag({qrcode: qr})
}
