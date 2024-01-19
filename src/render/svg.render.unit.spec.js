import { test } from '../../test-utils/unit/test.util.js'
import { QrCode } from '../qr-code.js'
import { createSvgTag } from './svg.render.js'
const helloWorldDarkDPath = 'M26,8h2v2h-2zM26,10h2v2h-2zM32,10h2v2h-2zM30,12h2v2h-2zM26,14h2v2h-2zM28,14h2v2h-2zM30,14h2v2h-2zM32,14h2v2h-2zM32,16h2v2h-2zM24,18h2v2h-2zM26,18h2v2h-2zM30,18h2v2h-2zM32,18h2v2h-2zM24,20h2v2h-2zM28,20h2v2h-2zM32,20h2v2h-2zM30,22h2v2h-2zM32,22h2v2h-2zM8,24h2v2h-2zM14,24h2v2h-2zM18,24h2v2h-2zM20,24h2v2h-2zM10,26h2v2h-2zM14,26h2v2h-2zM22,26h2v2h-2zM8,28h2v2h-2zM16,28h2v2h-2zM20,28h2v2h-2zM10,30h2v2h-2zM12,30h2v2h-2zM16,30h2v2h-2zM18,30h2v2h-2zM22,30h2v2h-2zM16,32h2v2h-2zM18,32h2v2h-2zM20,32h2v2h-2zM22,32h2v2h-2zM24,24h2v2h-2zM26,24h2v2h-2zM34,24h2v2h-2zM38,24h2v2h-2zM24,26h2v2h-2zM26,26h2v2h-2zM28,26h2v2h-2zM36,26h2v2h-2zM38,26h2v2h-2zM40,26h2v2h-2zM46,26h2v2h-2zM48,26h2v2h-2zM24,28h2v2h-2zM26,28h2v2h-2zM32,28h2v2h-2zM38,28h2v2h-2zM42,28h2v2h-2zM44,28h2v2h-2zM48,28h2v2h-2zM26,30h2v2h-2zM28,30h2v2h-2zM30,30h2v2h-2zM36,30h2v2h-2zM40,30h2v2h-2zM42,30h2v2h-2zM46,30h2v2h-2zM48,30h2v2h-2zM32,32h2v2h-2zM34,32h2v2h-2zM38,32h2v2h-2zM40,32h2v2h-2zM24,34h2v2h-2zM26,34h2v2h-2zM28,34h2v2h-2zM30,34h2v2h-2zM44,34h2v2h-2zM26,36h2v2h-2zM28,36h2v2h-2zM36,36h2v2h-2zM38,36h2v2h-2zM40,36h2v2h-2zM42,36h2v2h-2zM44,36h2v2h-2zM46,36h2v2h-2zM24,38h2v2h-2zM30,38h2v2h-2zM32,38h2v2h-2zM38,38h2v2h-2zM48,38h2v2h-2zM30,40h2v2h-2zM34,40h2v2h-2zM46,40h2v2h-2zM24,42h2v2h-2zM26,42h2v2h-2zM38,42h2v2h-2zM40,42h2v2h-2zM42,42h2v2h-2zM44,42h2v2h-2zM46,42h2v2h-2zM48,42h2v2h-2zM26,44h2v2h-2zM28,44h2v2h-2zM32,44h2v2h-2zM36,44h2v2h-2zM40,44h2v2h-2zM44,44h2v2h-2zM48,44h2v2h-2zM26,46h2v2h-2zM30,46h2v2h-2zM34,46h2v2h-2zM24,48h2v2h-2zM26,48h2v2h-2zM28,48h2v2h-2zM32,48h2v2h-2zM36,48h2v2h-2zM38,48h2v2h-2zM42,48h2v2h-2zM46,48h2v2h-2z'
const helloWorldDarkCornerBorderPath = 'M8,8h14v14h-14zM10,10v10h10v-10zM36,8h14v14h-14zM38,10v10h10v-10zM8,36h14v14h-14zM10,38v10h10v-10z'
const helloWorldDarkCornerCenterPath = 'M12,12h6v6h-6zM40,12h6v6h-6zM12,40h6v6h-6z'
const helloWorldLightDPath = 'M8,8h42v42h-42z'+helloWorldDarkDPath+helloWorldDarkCornerBorderPath+helloWorldDarkCornerCenterPath
const helloWorldSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="58px" height="58px" viewBox="0 0 58 58" preserveAspectRatio="xMinYMin meet" shape-rendering="crispEdges">'+
  '<g stroke="none" fill="white"><path d="M0,0h58v58h-58zM8,8v42h42v-42z"/>'+
  `<path d="${helloWorldLightDPath}" fill-rule="evenodd"/>`+
  `<path d="${helloWorldDarkDPath}" fill="black"/>`+
  `<path d="${helloWorldDarkCornerBorderPath}" fill="black"/>`+
  `<path d="${helloWorldDarkCornerCenterPath}" fill="black"/>`+
'</g></svg>'

test('SVG render - basic svg path test', ({ expect }) => {
  const qrcode = new QrCode()
  qrcode.addData('Hello world')
  qrcode.make()
  expect(createSvgTag({ qrcode })).toEqual(helloWorldSvg)
})
