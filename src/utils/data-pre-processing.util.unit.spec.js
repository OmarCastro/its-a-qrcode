import { test } from '../../test-utils/unit/test.util.js'
import { preProcess } from './data-pre-processing.util.js'

test('QR Code data pre process - trims by default on basic text', ({ expect }) => {
  expect(
    preProcess(`
     https://omarcastro.github.io/its-a-qrcode
     `)
  ).toEqual(
    'https://omarcastro.github.io/its-a-qrcode'
  )
})

test('QR Code data pre process - trim lines on if starts with BEGIN:VCARD', ({ expect }) => {
  // VCard of Simon Perreault, author of RFC6350 (https://datatracker.ietf.org/doc/html/rfc6350)
  expect(
    preProcess(`

    BEGIN:VCARD
    VERSION:4.0
    FN:Simon Perreault
    N:Perreault;Simon;;;ing. jr,M.Sc.
    BDAY:--0203
    GENDER:M
    EMAIL;TYPE=work:simon.perreault@viagenie.ca
    END:VCARD
        
    `)
  ).toEqual(
    `BEGIN:VCARD
VERSION:4.0
FN:Simon Perreault
N:Perreault;Simon;;;ing. jr,M.Sc.
BDAY:--0203
GENDER:M
EMAIL;TYPE=work:simon.perreault@viagenie.ca
END:VCARD`
  )
})


test('QR Code data pre process - empty attribute value trims by default', ({ expect }) => {
  expect(
    preProcess(`
     https://omarcastro.github.io/its-a-qrcode
     `, "  ")
  ).toEqual(
    'https://omarcastro.github.io/its-a-qrcode'
  )
})

test('QR Code data pre process - do not process on none or pre', ({ expect }) => {
  const input = `
  https://omarcastro.github.io/its-a-qrcode
  `
  expect(preProcess(input, " none ")).toEqual(input)
  expect(preProcess(input, "pre ")).toEqual(input)
})


test('QR Code data pre process - correct preprocess will apply the correct process', ({ expect }) => {
  // Note: all non blank lines have 2 spaces at the end
  const input = `   
  https://omarcastro.github.io/its-a-qrcode  

  dasdasd  

  fffff  
  `
  expect(preProcess(input, " none ")).toEqual(input)
  expect(preProcess(input, "trim-lines ")).toEqual(`
https://omarcastro.github.io/its-a-qrcode

dasdasd

fffff
`)

expect(preProcess(input, "no-blank-lines")).toEqual(`  https://omarcastro.github.io/its-a-qrcode  
  dasdasd  
  fffff  `)

})

test('QR Code data pre process - multiple preprocess will call them from left to right', ({ expect }) => {
  // Note: all non blank lines have 2 spaces at the end
  const input = `   
  https://omarcastro.github.io/its-a-qrcode  

  dasdasd 

  fffff  
  `


expect(preProcess(input, "trim-lines no-empty-lines")).toEqual(`https://omarcastro.github.io/its-a-qrcode
dasdasd
fffff`)

})

