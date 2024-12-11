import { test } from '../../test-utils/ui/test.util.js'

test('Img tag render - img tag is created correctly', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  page.waitForLoadState("load")
  const imgTag = await page.evaluate(async ([]) => {
    const QRCodeElement = customElements.get("qr-code")
    const {QrCode, createImgTag} = await QRCodeElement.loadJsAPI()
    const qrcode = new QrCode()
    qrcode.addData('Hello world')
    qrcode.make()
    const html = createImgTag({ qrcode })
    const div = document.createElement('div')
    div.classList.add('test-img-tag-render')
    div.innerHTML = html
    document.body.prepend(div)
    return html
  }, [])

  expect(imgTag).toMatch(/<img src="data:image\/(?:gif|png|jpeg|bmp|webp|svg\+xml)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}" width="58" height="58"\/>/)
  const qrCode = page.locator('.test-img-tag-render img')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--img-tag-render.png');

})

