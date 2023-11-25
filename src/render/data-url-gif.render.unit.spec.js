import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { createDataURL } from './data-url-gif.render.js'
const dataUrl = 'data:image/gif;base64,R0lGODdhOgA6AIAAAAAAAP///ywAAAAAOgA6AAAC/4yPqcvtD6OctNqLs968+w+G4gKU5nkiJYO2JuW6KsDGKEw367Ebe0/KSYAKoDFHTCQdv1tg+RRGfU5ojZqaBmfYl3aIrEpj1G4TZw7PWuVo1rp1e+FneR2cbl+17G+EHtZ0F4enE3ioR/hn86bGx+gFBulYNwkHkjWSkRly1PWp5MjhKQfK5TcqyiMTyslZmETWGlk6EUtJS9qIFtrmOoaIuiiI+wv6OhxMrDtHiyFb1Hy5yRpNrFnTxySlCW34bLnGbVdtG756y2gBmGisCMHu5x7N2wc1SF+xrHoaXy9mKog6c3keARoICyA6XL74PdjXrlnDiQS/raKIadwpih3T1p2zp8whvI8KdwnDhjKlypUsW7p8CTOmTAUFAAA7'

test('Error Correction Polynomial - values are memoized', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(createDataURL({ qrcode })).toEqual(dataUrl)
})
