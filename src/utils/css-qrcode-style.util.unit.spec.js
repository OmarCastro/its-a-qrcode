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

test('parseQrCodeStyles - style is case insensitive ', ({ expect, dom }) => {
  expect(parseQrCodeStyles({
    style: 'DoT dOt RoUnDeD',
  })).toEqual({
    dots: 'dot',
    cornerBorder: 'dot',
    cornerCenter: 'rounded',
  })
})
