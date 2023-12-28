import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { renderASCII } from './ascii.render.js'
const asciiHelloWorldSize1Result = `
█████████████████████████
██ ▄▄▄▄▄ ██ ██▀█ ▄▄▄▄▄ ██
██ █   █ ██▀▀ ▀█ █   █ ██
██ █▄▄▄█ █▀▀█▀ █ █▄▄▄█ ██
██▄▄▄▄▄▄▄█▄█▄▀ █▄▄▄▄▄▄▄██
██▄▀█ █▄▄▀  ▀██▄▀ ▀██▀▀██
██▄▀▀█ ▀▄▀▄ ▀▀▄█▀▄▀ ▄▀ ██
██████▄▄▄▄▀▀▀▀▄▄█▄▄█▀████
██ ▄▄▄▄▄ █▀▄▄▀▀█▄ ▄▄▄▄▀██
██ █   █ █▀▀█▄█▄█▀▀▀▀ ▀██
██ █▄▄▄█ ██ ▄▀▄▀▄█▄█▄█▄██
██▄▄▄▄▄▄▄█▄▄▄█▄█▄▄█▄█▄███
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`.slice(1, -1)

const asciiHelloWorldSize1NoMarginResult = `
 ▄▄▄▄▄ ██ ██▀█ ▄▄▄▄▄ 
 █   █ ██▀▀ ▀█ █   █ 
 █▄▄▄█ █▀▀█▀ █ █▄▄▄█ 
▄▄▄▄▄▄▄█▄█▄▀ █▄▄▄▄▄▄▄
▄▀█ █▄▄▀  ▀██▄▀ ▀██▀▀
▄▀▀█ ▀▄▀▄ ▀▀▄█▀▄▀ ▄▀ 
████▄▄▄▄▀▀▀▀▄▄█▄▄█▀██
 ▄▄▄▄▄ █▀▄▄▀▀█▄ ▄▄▄▄▀
 █   █ █▀▀█▄█▄█▀▀▀▀ ▀
 █▄▄▄█ ██ ▄▀▄▀▄█▄█▄█▄
       ▀   ▀ ▀  ▀ ▀ ▀
`.slice(1, -1)

const asciiHelloWorldSize2Result = `
██████████████████████████████████████████████████
██████████████████████████████████████████████████
████              ████  ████████              ████
████  ██████████  ████  ████  ██  ██████████  ████
████  ██      ██  ████████  ████  ██      ██  ████
████  ██      ██  ████        ██  ██      ██  ████
████  ██      ██  ██████████  ██  ██      ██  ████
████  ██████████  ██    ██    ██  ██████████  ████
████              ██  ██  ██  ██              ████
██████████████████████████    ████████████████████
████  ████  ██    ██    ██████  ██  ██████████████
██████  ██  ██████        ██████      ████    ████
████  ██████  ██  ██    ████  ████  ██    ██  ████
██████    ██    ██  ██      ████  ██    ██    ████
████████████        ████████    ██    ████████████
████████████████████        ████████████  ████████
████              ████    ██████            ██████
████  ██████████  ██  ████    ████  ████████  ████
████  ██      ██  ████████  ██  ██████████  ██████
████  ██      ██  ██    ██████████            ████
████  ██      ██  ████    ██  ██  ██  ██  ██  ████
████  ██████████  ████  ██  ██  ██████████████████
████              ██      ██  ██    ██  ██  ██████
██████████████████████████████████████████████████
██████████████████████████████████████████████████
`.slice(1, -1)

test('ASCII render - ascii size 1 test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode })).toEqual(asciiHelloWorldSize1Result)
})

test('ASCII render - ascii size 1 test no margin', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode, margin: 0 })).toEqual(asciiHelloWorldSize1NoMarginResult)
})

test('ASCII render - ascii size 2 test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode, cellSize: 2 })).toEqual(asciiHelloWorldSize2Result)
})
