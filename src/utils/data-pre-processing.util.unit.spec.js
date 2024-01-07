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
test('QR Code data pre process - use vcard process if starts with BEGIN:VCARD', ({ expect }) => {
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
    `BEGIN:VCARD\r
VERSION:4.0\r
FN:Simon Perreault\r
N:Perreault;Simon;;;ing. jr,M.Sc.\r
BDAY:--0203\r
GENDER:M\r
EMAIL;TYPE=work:simon.perreault@viagenie.ca\r
END:VCARD`
  )
})

test('QR Code data pre process - use vevent process if starts with BEGIN:VEVENT', ({ expect }) => {
  // VCard of Simon Perreault, author of RFC6350 (https://datatracker.ietf.org/doc/html/rfc6350)
  expect(
    preProcess(`

    BEGIN:VEVENT
    UID:19970901T130000Z-123401@example.com
    DTSTAMP:19970901T130000Z
    DTSTART:19970903T163000Z
    DTEND:19970903T190000Z
    SUMMARY:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Semper eget duis at tellus at urna condimentum mattis. Ultrices vitae auctor eu augue.
    CATEGORIES:IPSUM,LOREM
    END:VEVENT
        
    `)
  ).toEqual(
  `BEGIN:VEVENT
UID:19970901T130000Z-123401@example.com\r
DTSTAMP:19970901T130000Z\r
DTSTART:19970903T163000Z\r
DTEND:19970903T190000Z\r
SUMMARY:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiu\r
 smod tempor incididunt ut labore et dolore magna aliqua. Semper eget duis \r
 at tellus at urna condimentum mattis. Ultrices vitae auctor eu augue.\r
CATEGORIES:IPSUM,LOREM\r
END:VEVENT`
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

test('QR Code data pre process - vcard preproccess wraps line content when bypasses 75 octets', ({ expect }) => {
  const result = preProcess(`

  BEGIN:VCARD
  VERSION:4.0
  FN:Lorem Ipsum
  N:Ipsum;Lorem;;;ing. jr,M.Sc.
  EMAIL;TYPE=work:lorem.ipsum@viagenie.com
  NOTE:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Semper eget duis at tellus at urna condimentum mattis. Ultrices vitae auctor eu augue. Vulputate enim nulla aliquet porttitor lacus luctus accumsan. Sit amet nisl suscipit adipiscing bibendum est ultricies integer. Tellus in metus vulputate eu. Dui ut ornare lectus sit. Nibh sed pulvinar proin gravida hendrerit lectus a. Aliquet nibh praesent tristique magna sit amet purus gravida. Et malesuada fames ac turpis egestas sed. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit. Id neque aliquam vestibulum morbi blandit cursus risus. Tortor at risus viverra adipiscing at.
  END:VCARD
      
  `, "vcard")

  expect(result.split("\r\n").every(line => line.length <= 75)).toBe(true)

  expect(result).toEqual(
`BEGIN:VCARD\r
VERSION:4.0\r
FN:Lorem Ipsum\r
N:Ipsum;Lorem;;;ing. jr,M.Sc.\r
EMAIL;TYPE=work:lorem.ipsum@viagenie.com\r
NOTE:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmo\r
 d tempor incididunt ut labore et dolore magna aliqua. Semper eget duis at \r
 tellus at urna condimentum mattis. Ultrices vitae auctor eu augue. Vulputa\r
 te enim nulla aliquet porttitor lacus luctus accumsan. Sit amet nisl susci\r
 pit adipiscing bibendum est ultricies integer. Tellus in metus vulputate e\r
 u. Dui ut ornare lectus sit. Nibh sed pulvinar proin gravida hendrerit lec\r
 tus a. Aliquet nibh praesent tristique magna sit amet purus gravida. Et ma\r
 lesuada fames ac turpis egestas sed. Pellentesque adipiscing commodo elit \r
 at imperdiet dui accumsan sit. Id neque aliquam vestibulum morbi blandit c\r
 ursus risus. Tortor at risus viverra adipiscing at.\r
END:VCARD`
  )

})


