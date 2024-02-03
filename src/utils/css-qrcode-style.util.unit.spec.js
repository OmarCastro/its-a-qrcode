import { test } from '../../test-utils/unit/test.util.js'
import { parseQrCodeStyles } from './css-qrcode-style.util.js'

test('parseQrCodeStyles - 3 valid style on --qrcode-style will apply all styles ', ({ expect, dom }) => {
  expect(parseQrCodeStyles({
    style: ' dot dot rounded ',
  })).toEqual({
    dots: 'dot',
    cornerBorder: 'dot',
    cornerCenter: 'rounded',
  })
})

test('parseQrCodeStyles - --qrcode-style is case insensitive ', ({ expect, dom }) => {
  expect(parseQrCodeStyles({
    style: 'DoT dOt RoUnDeD',
  })).toEqual({
    dots: 'dot',
    cornerBorder: 'dot',
    cornerCenter: 'rounded',
  })
})


test('parseQrCodeStyles - 2 valid colors on --qrcode-style will apply the style on all dots then on corner border only', ({ expect, dom }) => {
  expect(parseQrCodeStyles({ 
    style: "square dOt"
   })).toEqual({
    dots: 'square',
    cornerBorder: 'dot',
    cornerCenter: 'default',
   })
})


test('parseQrCodeStyles - 1 valid color on --qrcode-style will apply the style on all dots only', ({ expect, dom }) => {
  expect(parseQrCodeStyles({ 
    style: "rounded"
   })).toEqual({
    dots: 'rounded',
    cornerBorder: 'default',
    cornerCenter: 'default',
   })
})


test('parseQrCodeStyles - all invalid styles on --qrcode-style will apply the default styles', ({ expect, dom }) => {
  expect(parseQrCodeStyles({ 
    style: "invalid-style invalid-style invalid-style"
   })).toEqual({
    dots: 'default',
    cornerBorder: 'default',
    cornerCenter: 'default',
   })
})