/** @import {ExpectApi} from './simple-expect.js' */

// these 2 lines are to prevent esbuild to bundle the await imports
/**
 * @param {string} str - import path
 * @returns {Promise<any>} import result
 */
const importModule = (str) => import(str)
let importStr

/**
 * @returns {Promise<{test: Test, expect: ExpectApi}>} adapted tests
 */
const fn = async () => {
  const customTestSetup = globalThis[Symbol.for('custom-unit-test-setup')]
  if (customTestSetup) {
    const { test, expect } = await customTestSetup()
    return { test, expect }
  } else {
    // init unit tests for Playwright

    importStr = './setup-unit-test-playwright.js'
    const { test, expect } = await importModule(importStr)
    return { test, expect }
  }
}

export const { test, expect } = await fn()
const inspect = (await import('object-inspect')).default

export const formatted = (strings, ...values) => String.raw(
  { raw: strings },
  ...values.map(value => inspect(value)),
)

/** @type {(target: unknown) => asserts target} */
export const assert = (target) => {
  if (!target) {
    throw Error('assertion failed')
  }
}

/**
 * @typedef {(description: string, fn: TestCall, info: TestInfo) => any} Test
 */

/**
 * @typedef {{
 *  skip(skipMessage: string): void
 *  skip(invariant: boolean, skipMessage: string): void
 * }} TestInfo
 */

/**
 * @callback TestCall
 * @param {TestAPI} callback
 */

/**
 * @callback TestAPICall
 * @param {string} description
 * @param {() => any} step
 * @returns {Promise<any>}
 */

/**
 * @typedef {object} TestAPI
 * @property {ExpectApi} expect - expect API
 * @property {TestAPICall} step - test step
 * @property {Window} dom - dom fixture
 * @property {import('./fixtures/fetch.unit.fixture.js').MockApi} fetch - dom fixture
 * @property {import('./fixtures/timezone.unit.fixture.js').MockApi} timezone - dom fixture
 * @property {import('./fixtures/garbage-collector.unit.fixture.js').GarbageCollectionApi} gc - dom fixture
 */
