import { test } from '../../test-utils/ui/test.util.js'

test('qr-code element visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--hello-world')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--hello-world.png');
});

test('svg render visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--svg')
  await expect(qrCode.locator("svg")).toBeVisible() 
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--hello-world.png');
});


test('error correction level reaction visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--error-correction-level')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--ec-level-L.png');

  await qrCode.evaluate(node => node.setAttribute('data-error-correction-level', 'M'));
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--ec-level-M.png');

  await qrCode.evaluate(node => node.setAttribute('data-error-correction-level', 'Q'));
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--ec-level-Q.png');

  await qrCode.evaluate(node => node.setAttribute('data-error-correction-level', 'H'));
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--ec-level-H.png');
});

test('text content react testing', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--content')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--content-12345.png');

  await qrCode.evaluate(node => node.childNodes[0].nodeValue = "text node updated");
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--content-text-node-updated.png');

  await qrCode.evaluate(node => node.textContent = "text content changed");
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--content-text-content-changed.png');
});

test('dot style image test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--dot-style')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--dot-style-12345.png');
});


test('rounded style image test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const qrCode = page.locator('.qr-code--rounded-style')
  await expect.soft(await qrCode.screenshot()).toMatchSnapshot('qr-code--rounded-style-12345.png');
});

