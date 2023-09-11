// @ts-nocheck Since this file adds info to globalThis as to simulate a browser
// on a Deno environment, it is better to disable type checking and code coverage
// for this file
/** @type {Window} */
let windowObj
let domResetFunction

if ('Deno' in globalThis || globalThis.window == null) {
  // running in Deno or node
  const { JSDOM } = await import('jsdom')
  const jsdom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><head></head><body></body></html>',
    {
      url: 'https://example.com/',
      referrer: 'https://example.org/',
      contentType: 'text/html',
      storageQuota: 10000000,
      pretendToBeVisual: true,
    },
  )

  windowObj = jsdom.window

  globalThis.ShadowRoot = windowObj.ShadowRoot
  globalThis.MutationObserver = windowObj.MutationObserver
  globalThis.CustomEvent = windowObj.CustomEvent
  globalThis.HTMLElement = windowObj.HTMLElement
  globalThis.Element = windowObj.Element
  globalThis.Document = windowObj.Document
  globalThis.window = windowObj
  globalThis.DOMParser = windowObj.DOMParser
  globalThis.requestAnimationFrame = windowObj.requestAnimationFrame
  globalThis.cancelAnimationFrame = windowObj.cancelAnimationFrame
  globalThis.requestIdleCallback = windowObj.requestIdleCallback
  globalThis.cancelIdleCallback = windowObj.cancelIdleCallback
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

/** @type {Window} */
export const window = windowObj
export function resetDom () {
  domResetFunction()
}
