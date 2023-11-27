import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { createImgTag } from './img-tag.render.js'
const helloWorldSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAYAAADhu0ooAAAABmJLR0QA/wD/AP+gvaeTAAABP0lEQVRoge2ZQQ7DIAwES5X/f5mefLG0Wts1RIKdW5UESkaOsRlzzvm5gO/bf2AXWuhpaKGnoYWexsNuGGOUBrb0bM+j393zIWTUE91AeSNVs9X5EDKKQG+QGahuqavzeWS0CxSzu4smGe3Cm+uKuSwyisi+eZ8vfR7tng8ho57qHhSNw8x2zWdcY3Ts6gIyk/rqNtGWR1nV4u9D+TVb7bAqyJBRI1pf+uvRcbOGql9jGTWihpBpFnNR/h1HRhFsJ8PMMliejfacPDLqQcZQnsyOE+0GZp83rjG6fK8bzYvZ64pRADXadRbStXdVjBKWn72w6qVazWSRUUS2L1vdo0ZjVF9dx/JOvdHVK1KHgbDNqCd6JuNRjBKWn70Y0XqV5WHFKOG1sxcEy7uKUcK2s5e3ucaoFnoaWuhpaKGn8QMwOyh34UTyBAAAAABJRU5ErkJggg=='
const helloWorldSvg = `<img src="${helloWorldSrc}" width="58" height="58"/>`

test('Error Correction Polynomial - values are memoized', ({ expect, dom }) => {
  const canvas = dom.document.createElement('canvas')
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(createImgTag({ qrcode })).toEqual(helloWorldSvg)
})
