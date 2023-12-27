import { test } from '../../test-utils/unit/test.util.js'
import { escapeXml } from './escape-xml.util.js'

test('Escape xml, basic escape test', ({ expect }) => {
 
  expect(
    `<svg title="${escapeXml(`test ok" onclick="alert('error!'"`)}"></svg>`
  ).toEqual(
    '<svg title="test ok&quot; onclick=&quot;alert(&apos;error!&apos;&quot;"></svg>'
  )

})
