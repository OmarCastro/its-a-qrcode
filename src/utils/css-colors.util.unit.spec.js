import { test } from '../../test-utils/unit/test.util.js'
import { parseQrCodeColors } from './css-colors.util.js'

test('parseQrCodeColors - 4 valid colors on --qrcode-color will apply all colors ', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'brown'
   })
})


test('parseQrCodeColors - 3 valid colors on --qrcode-color will apply on 3 colors white the cornerCenterColor uses cornerBorderColor as fallback', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'blue'
   })
})

test('parseQrCodeColors - 2 valid colors on --qrcode-color will apply on all dark areas then on the white area', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'red',
    cornerCenterColor: 'red'
   })
})

test('parseQrCodeColors - just one color on --qrcode-color will apply on all dark areas', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "blue"
   })).toEqual({
    darkColor: 'blue',
    lightColor: 'white',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'blue'
   })
})

test('parseQrCodeColors - with just one invalid color on --qrcode-color will apply the default color (black and white)', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "invalid-color"
   })).toEqual({
    darkColor: 'black',
    lightColor: 'white',
    cornerBorderColor: 'black',
    cornerCenterColor: 'black'
   })
})

test('parseQrCodeColors - more than 4 colors on --qrcode-color will ignore after the 4th color', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown black white"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'brown'
   })
})

test('parseQrCodeColors - with all invalid colors on --qrcode-color will apply the default color (black and white)', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "invalid-color invalid-color invalid-color invalid-color"
   })).toEqual({
    darkColor: 'black',
    lightColor: 'white',
    cornerBorderColor: 'black',
    cornerCenterColor: 'black'
   })
})

test('parseQrCodeColors - --qrcode-coner-color ovewrites --qrcode-color on corner colors ', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    cornerColor: "cyan"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'cyan',
    cornerCenterColor: 'cyan'
   })
})

test('parseQrCodeColors - --qrcode-coner-color also suppors border and center colors ', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    cornerColor: "cyan magenta"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'cyan',
    cornerCenterColor: 'magenta'
   })
})

test('parseQrCodeColors - --qrcode-coner-border-color overrides --qrcode-coner-color and --qrcode-color ', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    cornerColor: "cyan",
    cornerBorderColor: "red"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'red',
    cornerCenterColor: 'cyan'
   })
})

test('parseQrCodeColors - --qrcode-coner-center-color overrides --qrcode-coner-color and --qrcode-color ', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    cornerColor: "cyan",
    cornerCenterColor: "red"
   })).toEqual({
    darkColor: 'red',
    lightColor: 'green',
    cornerBorderColor: 'cyan',
    cornerCenterColor: 'red'
   })
})

test('parseQrCodeColors - --qrcode-dark-color overrides --qrcode-color on dark dots', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    darkColor: "cyan",
   })).toEqual({
    darkColor: 'cyan',
    lightColor: 'green',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'brown'
   })
})


test('parseQrCodeColors - --qrcode-light-color overrides --qrcode-color on light spot dots', ({ expect, dom }) => {
  expect(parseQrCodeColors({ 
    color: "red green blue brown",
    lightColor: "cyan",
   })).toEqual({
    darkColor: 'red',
    lightColor: 'cyan',
    cornerBorderColor: 'blue',
    cornerCenterColor: 'brown'
   })
})

