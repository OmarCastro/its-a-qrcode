import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { createImgTag } from './img-tag.render.js'
const helloWorldSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAYAAADhu0ooAAAABmJLR0QA/wD/AP+gvaeTAAABU0lEQVRoge2aQQ7DIAwES9X/f5leysXSam1jGgnv3NomJmTiAKZjzjlfDXg/fQH/Qh29DXX0NtTR2/iwA8YYqcB2eF5x2LBd1Z5FRi3eCVTUCDJd3Z6MItAdZAaqczY6RZfRapAZr9ldZLQaZCw7bkaRUUQ0l6yxdb7XZFXuyqhlN5esSWa2OnfbGB1PVQFR7p6ijVH3epTNVb1v1/W9N57eukHcORq94+ytGT0PPQEs3qKN0XSOsnGR5SiKH42jCoOBGs2aQZ+zcdj1MNoY3Z4ZZd+u6HzvExRFRssa2DSO4qkKCKBGq/de0O/Z9rxm2xg9vvfCVj82fnT14j1ORhHRvRDvngya87LrUI4ajlfqvRUGlsMsvnL0x3GjaPUSXc9G68IWGUXsTo29plB72f86yKglO+dlM6VoRSFb921j9LG9l3/Txqg6ehvq6G2oo7fxBVjsJGz8l4DZAAAAAElFTkSuQmCC'
const helloWorldSvg = `<img src="${helloWorldSrc}" width="58" height="58"/>`

test('Error Correction Polynomial - values are memoized', ({ expect, dom }) => {
  const canvas = dom.document.createElement('canvas')
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(createImgTag({ qrcode })).toEqual(helloWorldSvg)
})
