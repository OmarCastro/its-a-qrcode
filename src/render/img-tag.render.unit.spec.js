import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { createImgTag } from './img-tag.render.js'
const helloWorldSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAYAAADhu0ooAAAABmJLR0QA/wD/AP+gvaeTAAABPUlEQVRoge2Z0Q6CMAxFN+P//zI+GIyplNt1ZYnhnDfD2MgOte1oDQAAALL0wJgtM/G2vW/rvZ/+/nmgHnmk41vPLj6ys/4bz+hAz4DFGsmaza7ngVEPbweVgaihqvUsGK3Ci9ms4SwYrcKaq4q5UTDqMbrzNl/aPFq9ngdGLRM16OE8ymzVeju3MSq3bSsKEmVydpkuXoHbGC3Lo6prseO8/Dra7dC9GKTRaH9pr0fnVWbV80TB6E7UkGdaxVyU2Xkw6qEqGWVWofJs1ixGLd4OenlydJ7oaSAxKri81o3mxdHrB2apdVtb8O3ls9Bg7Ro1/CUSo60t+PaiupdsNzMKRj1Gz2WzlUw0RqmMDJef1O9UnRVxwiBYZtSSNUOMCi7/9rIT7VdVHiZGBctrXTXOjo/+W9O9AAAAwDQvbK4NecbxEiUAAAAASUVORK5CYII='
const helloWorldSvg = `<img src="${helloWorldSrc}" width="58" height="58"/>`

test('Error Correction Polynomial - values are memoized', ({ expect, dom }) => {
  const canvas = dom.document.createElement('canvas')
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(createImgTag({ qrcode })).toEqual(helloWorldSvg)
})
