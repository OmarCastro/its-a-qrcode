// @ts-nocheck Since this file adds info to globalThis as to simulate a browser
// on a Deno environment, it is better to disable type checking and code coverage
// for this file
/** @type {Window} */
let windowObj
let domResetFunction

if ('Deno' in globalThis || globalThis.window == null) {
  // running in Deno or node
  const { JSDOM } = await import('jsdom')
  const { CanvasRenderingContext2D } = await import('canvas')
  const jsdom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><head></head><body></body></html>',
    {
      url: 'https://example.com/',
      referrer: 'https://example.org/',
      contentType: 'text/html',
      storageQuota: 10000000,
      pretendToBeVisual: true,
    }
  )

  windowObj = jsdom.window
  windowObj.CanvasRenderingContext2D = CanvasRenderingContext2D
  await polyfillPath2D(windowObj)
  globalThis.ShadowRoot = windowObj.ShadowRoot
  globalThis.MutationObserver = windowObj.MutationObserver
  globalThis.CustomEvent = windowObj.CustomEvent
  globalThis.HTMLElement = windowObj.HTMLElement
  globalThis.Element = windowObj.Element
  globalThis.Document = windowObj.Document
  globalThis.window = windowObj
  globalThis.DOMParser = windowObj.DOMParser
  globalThis.Path2D = windowObj.Path2D
  globalThis.requestAnimationFrame = windowObj.requestAnimationFrame
  globalThis.cancelAnimationFrame = windowObj.cancelAnimationFrame
  globalThis.requestIdleCallback = windowObj.requestIdleCallback
  globalThis.cancelIdleCallback = windowObj.cancelIdleCallback
  globalThis.document = windowObj.document
  domResetFunction = () => {
    const { documentElement } = windowObj.document
    documentElement.innerHTML = '<head></head><body></body>'
    Array.from(documentElement.attributes).forEach(attr => documentElement.removeAttribute(attr.name))
    documentElement.setAttribute('lang', 'en')
  }
} else {
  windowObj = globalThis.window
  domResetFunction = () => {}
}

/**
 * @param {Window} window - target window object
 */
async function polyfillPath2D (window) {
  const {
    Path2D,
    applyPath2DToCanvasRenderingContext,
    applyRoundRectToCanvasRenderingContext2D,
    applyRoundRectToPath2D,
  } = await import('path2d')
  if (window) {
    if (window.CanvasRenderingContext2D && !window.Path2D) {
      // @ts-expect-error polyfilling
      window.Path2D = Path2D
      applyPath2DToCanvasRenderingContext(window.CanvasRenderingContext2D)
    }
    applyRoundRectToPath2D(window.Path2D)
    applyRoundRectToCanvasRenderingContext2D(window.CanvasRenderingContext2D)
  }
}

/** @type {Window} */
export const window = windowObj
export const resetDom = () => domResetFunction()
