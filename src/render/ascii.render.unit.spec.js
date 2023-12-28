import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { renderASCII } from './ascii.render.js'
import { MODE_ALPHA_NUM, MODE_NUMBER, MODE_KANJI } from '../modes/mode-bits.constants.js'

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

test('ASCII render - ascii size 1 test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode })).toEqual(asciiHelloWorldSize1Result)
})

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

test('ASCII render - ascii size 1 test no margin', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode, margin: 0 })).toEqual(asciiHelloWorldSize1NoMarginResult)
})


const ascii12345Result = `
█████████████████████████
██ ▄▄▄▄▄ █▄▀█▄▄█ ▄▄▄▄▄ ██
██ █   █ █▀█ █▄█ █   █ ██
██ █▄▄▄█ █ ▄ ▀▄█ █▄▄▄█ ██
██▄▄▄▄▄▄▄█ ▀ ▀ █▄▄▄▄▄▄▄██
██ ▀▀▀ █▄▄ ▄█ ▀▄▄ ▄ ▀█▄██
██▀▄▀█▄ ▄  █▀▄█▀ ▄ ▀▀▀ ██
███▄▄▄█▄▄▄▀▀██   ███▀▀ ██
██ ▄▄▄▄▄ █▄██▀ ▄█▀█ █ ███
██ █   █ █▄█▀ ▀█▄ ▄▀▄  ██
██ █▄▄▄█ ███ ▄█▀ ▄ ▄ ▀███
██▄▄▄▄▄▄▄█▄▄██▄▄▄███▄▄▄██
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`.slice(1, -1)

test('ASCII render - ascii size number test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('12345')
  qrcode.make()
  expect(qrcode.dataList[0].mode).toEqual(MODE_NUMBER)
  expect(renderASCII({ qrcode })).toEqual(ascii12345Result)
})

const asciiIPV6Result = `
█████████████████████████████
██ ▄▄▄▄▄ █▀▄█▄▄█ ▄██ ▄▄▄▄▄ ██
██ █   █ █████ ██▀▄█ █   █ ██
██ █▄▄▄█ █▄█ ▄    ▀█ █▄▄▄█ ██
██▄▄▄▄▄▄▄█▄▀▄▀▄█▄▀▄█▄▄▄▄▄▄▄██
██▄█ ▀ ▀▄▀██▀▄▄ █▀▄▀▀█▄▀█▄▀██
██▀▄ ██ ▄  █▄  ▄ ▀▄ ▄ ▄▄▀▄▄██
████▀▄  ▄█▀█  ▄█ ▀▄▀▄█  ██▄██
██▄▀▀█▀▀▄▀▀██▀▄██▀▄▀▄█▄▀▄▄███
██▄█▄█▄█▄█  ▄▄▄█ ▄ ▄▄▄ ▀▄ ▄██
██ ▄▄▄▄▄ ██▄█▀  ▀▄ █▄█ █▀▀▀██
██ █   █ █▄▀██▄▄▀█  ▄ ▄▄▀█▄██
██ █▄▄▄█ █▄▄█▀█▄  █▀▄   ▀▀ ██
██▄▄▄▄▄▄▄█▄▄▄█▄▄██▄█▄▄█▄██▄██
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`.slice(1, -1)

test('ASCII render - ascii size alphaNum test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('2345:425:2CA1:0000:0000:567:5673:23B5')
  qrcode.make()
  expect(qrcode.dataList[0].mode).toEqual(MODE_ALPHA_NUM)
  expect(renderASCII({ qrcode })).toEqual(asciiIPV6Result)
})

const asciiKanjiQrResult = `
█████████████████████████
██ ▄▄▄▄▄ █▀▄▀ ██ ▄▄▄▄▄ ██
██ █   █ ██▀ ▀ █ █   █ ██
██ █▄▄▄█ █▄▄▄ ▄█ █▄▄▄█ ██
██▄▄▄▄▄▄▄█▄█▄█▄█▄▄▄▄▄▄▄██
██▄▀▄▀ █▄▀█ █▀▄██▀ ▀▀ ███
██▄ ▀▄▀▀▄ ▀ ▀ ▀▀▀▀██▄████
██▄█▄▄█▄▄▄▀▀▄ ██▀█ ▄ ▀███
██ ▄▄▄▄▄ ███ ▀▄▀▀▄▀█▄█ ██
██ █   █ █▄▄ ▀ ▀ █▄▀▄ ▄██
██ █▄▄▄█ █▄  ▀██ ▀ ▀▀▀▄██
██▄▄▄▄▄▄▄█▄█▄██▄▄█▄▄▄████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`.slice(1, -1)

test('ASCII render - ascii size kanji test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('こんにちは世界') // "Hello world" in kanji
  qrcode.make()
  expect(qrcode.dataList[0].mode).toEqual(MODE_KANJI)
  expect(renderASCII({ qrcode })).toEqual(asciiKanjiQrResult)
})

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

test('ASCII render - ascii size 2 test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(renderASCII({ qrcode, cellSize: 2 })).toEqual(asciiHelloWorldSize2Result)
})
