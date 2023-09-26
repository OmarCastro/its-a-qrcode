import { QrCode } from '../src/qr-code.js'
import { createSvgTag } from '../src/render/svg.render.js'

function createQrCode (text, typeNumber, errorCorrectionLevel, mode) {
  const qr = new QrCode(typeNumber || 4, errorCorrectionLevel || 'M')
  qr.addData(text, mode)
  qr.make()

  return createSvgTag({ qrcode: qr })
};

function updateQrCode () {
  const form = document.forms.qrForm
  const text = form.elements.msg.value.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
  const t = form.elements.t.value
  const e = form.elements.e.value
  const m = form.elements.m.value
  const mb = form.elements.mb.value
  document.getElementById('qr').innerHTML = createQrCode(text, t, e, m, mb)
};

window.addEventListener('click', (e) => {
  if (e.target.matches('.button--update')) {
    updateQrCode()
  }
})

function crtOpt (value, label) {
  const opt = document.createElement('option')
  opt.appendChild(document.createTextNode(label))
  opt.value = value
  return opt
};

const t = document.forms.qrForm.elements.t
t.appendChild(crtOpt('' + 0, 'Auto Detect'))
for (let i = 1; i <= 40; i += 1) {
  t.appendChild(crtOpt('' + i, '' + i))
}
t.value = '0'

updateQrCode()
