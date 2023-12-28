import { test } from '../../test-utils/ui/test.util.js'

test('qr-code element visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  
  const colorWheel = page.locator('.qr-code--hello-world')

  await expect.soft(await colorWheel.screenshot()).toMatchSnapshot('qr-code--hello-world.png');
});

test('error correction level reaction visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html');
  const colorWheel = page.locator('.qr-code--error-correction-level')
  await expect.soft(await colorWheel.screenshot()).toMatchSnapshot('qr-code--ec-level-L.png');

  await colorWheel.evaluate(node => node.setAttribute('data-error-correction-level', 'M'));
  await expect.soft(await colorWheel.screenshot()).toMatchSnapshot('qr-code--ec-level-M.png');

  await colorWheel.evaluate(node => node.setAttribute('data-error-correction-level', 'Q'));
  await expect.soft(await colorWheel.screenshot()).toMatchSnapshot('qr-code--ec-level-Q.png');

  await colorWheel.evaluate(node => node.setAttribute('data-error-correction-level', 'H'));
  await expect.soft(await colorWheel.screenshot()).toMatchSnapshot('qr-code--ec-level-H.png');

});
