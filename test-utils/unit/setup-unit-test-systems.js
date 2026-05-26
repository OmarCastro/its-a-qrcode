/** @import { Expect } from 'expect' */
globalThis[Symbol.for('custom-unit-test-setup')] = async function setupUnitTestsForSystems () {
  const { expect } = await import('./simple-expect.js')
  const { window, resetDom } = await import('./fixtures/dom.unit.fixture.js')
  const { setup: setupFetchMock, teardown: teardownFetchMock } = await import('./fixtures/fetch.unit.fixture.js')
  const { setup: setupTimezoneMock, teardown: teardownTimezoneMock } = await import('./fixtures/timezone.unit.fixture.js')
  const { setup: setupGCFixture } = await import('./fixtures/garbage-collector.unit.fixture.js')

  /**
   * @param {string} message - message to show on the report on skip
   */
  function SkipException (message) {
    if (!(this instanceof SkipException)) { return new SkipException(message) }
    this.message = message
  }

  async function runTests () {
    const startTestTimestamp = performance.now()
    const testAmount = unitTests.length
    let failedTestAmount = 0
    let skippedTestAmount = 0

    console.log(`[unit-test] ${testAmount} tests to run`)
    let result = '[unit-test] results: \n'

    for (const { description, test } of unitTests) {
      try {
        await test()
        result += `  [PASS] ${description}\n`
      } catch (e) {
        if (e instanceof SkipException) {
          skippedTestAmount++
          result += `  [SKIP] ${description} : ${e.message}\n`
        } else {
          console.log(e)
          failedTestAmount++
          result += `**[FAIL] ${description}\n`
        }
      }
    }
    const endTestTimestamp = performance.now()
    console.log(result)
    const skippedTestReport = skippedTestAmount <= 0 ? '' : `, ${skippedTestAmount} tests skipped`

    if (failedTestAmount <= 0) {
      console.log(`[unit-test] All tests passed${skippedTestReport}`)
    } else {
      console.log(`[unit-test] ${failedTestAmount} tests failed${skippedTestReport}`)
    }

    console.log(`[unit-test] tests took ${(endTestTimestamp - startTestTimestamp).toFixed(3)} milliseconds. ${endTestTimestamp.toFixed(3)} milliseconds since startup.`)
    process.exitCode = failedTestAmount > 0 ? 1 : 0
  }

  function scheduleUnitTestRun () {
    if (!scheduleUnitTestRun.alreadyScheduled) {
      setTimeout(runTests, 0)
      scheduleUnitTestRun.alreadyScheduled = true
    }
  }

  const notTestsFoundTimeout = setTimeout(() => {
    console.error('No tests found, aborting')
    process.exit(1)
  }, 250)

  const unitTests = []
  const test = (description, testFunction) => {
    unitTests.push({
      description,
      test: async () => {
        const postTestCallbacks = new Set()
        const fixtureCache = {}
        try {
          await testFunction({
            step: async (_, callback) => await callback(),
            expect,
            get dom () {
              resetDom()
              return window
            },
            get gc () {
              fixtureCache.gc ??= setupGCFixture()
              return fixtureCache.gc
            },
            get timezone () {
              fixtureCache.timezone ??= setupTimezoneMock()
              postTestCallbacks.add(teardownTimezoneMock)
              return fixtureCache.timezone
            },
            get fetch () {
              fixtureCache.fetch ??= setupFetchMock()
              postTestCallbacks.add(teardownFetchMock)
              return fixtureCache.fetch
            },
          })
        } finally {
          postTestCallbacks.forEach(callback => callback())
        }

      },
    })
    clearTimeout(notTestsFoundTimeout)
    scheduleUnitTestRun()
  }

  return { test, expect }
}
