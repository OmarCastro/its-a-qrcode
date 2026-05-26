const { test: base, expect: baseExpect } = await import('@playwright/test')
const { window, resetDom } = await import('./fixtures/dom.unit.fixture.js')
const { setup: setupFetchMock, teardown: teardownFetchMock } = await import('./fixtures/fetch.unit.fixture.js')
const { setup: setupTimezoneMock, teardown: teardownTimezoneMock } = await import('./fixtures/timezone.unit.fixture.js')
const { setup: setupGCFixture } = await import('./fixtures/garbage-collector.unit.fixture.js')

export const expect = baseExpect

/** @type {any} */
export const test = base.extend({
  step: async ({}, use) => {
    await use(test.step)
  },
  dom: async ({}, use) => {
    resetDom()
    await use(window)
  },
  expect: async ({}, use) => {
    await use(expect)
  },
  fetch: async ({}, use) => {
    const api = setupFetchMock()
    await use(api)
    teardownFetchMock()
  },
  timezone: async ({}, use) => {
    const api = setupTimezoneMock()
    await use(api)
    teardownTimezoneMock()
  },
  gc: async ({}, use) => {
    const api = setupGCFixture()
    await use(api)
  },
})
