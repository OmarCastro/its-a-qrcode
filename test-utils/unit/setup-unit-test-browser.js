/** @import { Expect } from 'expect' */
globalThis[Symbol.for('custom-unit-test-setup')] = async function setupUnitTestsForSystems () {
  const { expect } = await import('./simple-expect.js')
  const { setup: setupFetchMock, teardown: teardownFetchMock } = await import('./fixtures/fetch.unit.fixture.js')
  const { setup: setupTimezoneMock, teardown: teardownTimezoneMock } = await import('./fixtures/timezone.unit.fixture.js')

  /**
   * @param {string} message - message to show on the report on skip
   */
  function SkipException (message) {
    if (!(this instanceof SkipException)) { return new SkipException(message) }
    this.message = message
  }

  async function runTests () {
    const startTestTimestamp = performance.now()
    const totalAmount = unitTests.length
    let failedTestAmount = 0
    let skippedTestAmount = 0

    let logs = ''
    const log = (text) => {
      console.log(text)
      logs += String(text) + '\n'
    }
    console.log(`[unit-test] ${totalAmount} tests to run`)
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
          log(e)
          failedTestAmount++
          result += `**[FAIL] ${description}\n`
        }
      }
    }

    const endTestTimestamp = performance.now()
    log(result)

    if (failedTestAmount <= 0) {
      log('[unit-test] All tests passed')
    } else {
      log(`[unit-test] ${failedTestAmount} tests failed`)
    }
    console.log({ ...globalThis[Symbol.for('unit-test-info')], endTestTimestamp })
    log(`[unit-test] tests took ${endTestTimestamp - startTestTimestamp} milliseconds. ${endTestTimestamp} milliseconds since page load.`)
    const testedAmount = totalAmount - skippedTestAmount
    reportLogs({
      logs,
      failed: failedTestAmount,
      total: totalAmount,
      tested: testedAmount,
      skipped: skippedTestAmount,
      passed: testedAmount - failedTestAmount,
    })
  }

  function scheduleUnitTestRun () {
    if (!scheduleUnitTestRun.alreadyScheduled) {
      setTimeout(runTests, 0)
      scheduleUnitTestRun.alreadyScheduled = true
    }
  }

  const notTestsFoundTimeout = setTimeout(() => {
    reportLogs('No tests found')
  }, 250)

  const unitTests = []
  const noopGC = async () => { }
  noopGC.status = {
    enabled: false,
    reason: 'Garbage collection not enabled',
  }
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
            dom: window,
            get fetch () {
              fixtureCache.fetch ??= setupFetchMock()
              postTestCallbacks.add(teardownFetchMock)
              return fixtureCache.fetch
            },
            get timezone () {
              fixtureCache.timezone ??= setupTimezoneMock()
              postTestCallbacks.add(teardownTimezoneMock)
              return fixtureCache.timezone
            },
            get gc () {
              skip(noopGC.status.reason)
              return noopGC
            },
          }, { skip })
        } finally {
          postTestCallbacks.forEach((callback) => callback())
          postTestCallbacks.clear()
        }

      },
    })
    clearTimeout(notTestsFoundTimeout)
    scheduleUnitTestRun()
  }

  /**
   * @param {string|boolean} invariantOrMessage - conditional or skip message to show on report
   * @param {string} [message] - skip message to show on report
   */
  function skip (invariantOrMessage, message) {
    if (typeof invariantOrMessage === 'string') {
      throw SkipException(invariantOrMessage)
    } else if (invariantOrMessage) {
      throw SkipException(message)
    }
  }

  return { test, expect }
}

/**
 * @param {object} report - test report
 * @param {string} report.logs - test logs
 * @param {number} report.failed - amount of failed tests
 * @param {number} report.passed - amount of passed tests
 * @param {number} report.total - total amount tests
 */
async function reportLogs (report) {
  const { body } = window.document
  const { reportType } = globalThis[Symbol.for('unit-test-info')]
  const svgPromise = createSVGResponse(report)
  if (reportType === 'badge') {
    const svg = await svgPromise
    body.innerHTML = svg
  } else {
    body.replaceChildren(...report.logs.split('\n').map((log) => {
      const div = document.createElement('div')
      div.textContent = log
      return div
    }))
  }
  const inIframe = window.self !== window.top
  if (inIframe) {
    const svg = await svgPromise
    window.top.postMessage({ message: 'unit test report', data: report, badgeSvg: svg })
  }
}

const badgeColors = {
  green: { dark: '#060', light: '#90e59a' },
  red: { dark: '#a00', light: '#f77' },
}

let badgeFetch = null

const createSVGResponse = async (report) => {
  const label = `${report.passed} / ${report.tested}`
  const color = report.failed > 0 ? badgeColors.red : badgeColors.green
  const { badgeUrl } = globalThis[Symbol.for('unit-test-info')]
  badgeFetch ??= fetch(badgeUrl).then((response) => response.text())
  const badgeSvg = await badgeFetch
  return badgeSvg
    .replaceAll('RUNNING...', label)
    .replaceAll('--dark-fill: #05a; --light-fill: #acf;', `--dark-fill: ${color.dark}; --light-fill: ${color.light};`)
}
