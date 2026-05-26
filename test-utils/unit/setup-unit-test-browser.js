/** @import { Expect } from 'expect' */
globalThis[Symbol.for('custom-unit-test-setup')] = async function setupUnitTestsForSystems () {
  const { expect } = await import('./simple-expect.js')
  const { setup: setupFetchMock, teardown: teardownFetchMock } = await import('./fixtures/fetch.unit.fixture.js')
  const { setup: setupTimezoneMock, teardown: teardownTimezoneMock } = await import('./fixtures/timezone.unit.fixture.js')
  const { setup: setupGCFixture } = await import('./fixtures/garbage-collector-browser.unit.fixture.js')

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

    const tapReport = [`1..${totalAmount}`]
    for (const [testIndex, { description, test }] of unitTests.entries()) {
      const testNumber = testIndex + 1
      try {
        await test()
        result += `  [PASS] ${description}\n`
        tapReport.push(`ok ${testNumber} - ${description}`)
      } catch (e) {
        if (e instanceof SkipException) {
          skippedTestAmount++
          result += `  [SKIP] ${description} : ${e.message}\n`
          tapReport.push(`ok ${testNumber} - ${description} # SKIP ${e.message}`)
        } else {
          log(e)
          failedTestAmount++
          result += `**[FAIL] ${description}\n`
          tapReport.push(`not ok ${testNumber} - ${description}`)
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

    const timeMetrics = {
      pageLoad: performance.timeOrigin,
      testDuration: endTestTimestamp - startTestTimestamp,
      testDurationSinceLoad: endTestTimestamp
    }

    console.log({ ...globalThis[Symbol.for('unit-test-info')], endTestTimestamp })
    log(`[unit-test] tests took ${timeMetrics.testDuration} milliseconds. ${timeMetrics.testDurationSinceLoad} milliseconds since page load.`)
    const testedAmount = totalAmount - skippedTestAmount
    reportLogs({
      logs,
      failed: failedTestAmount,
      total: totalAmount,
      tested: testedAmount,
      skipped: skippedTestAmount,
      passed: testedAmount - failedTestAmount,
      tapReport: tapReport.join('\n'),
      timeMetrics
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
              fixtureCache.gc ??= setupGCFixture()
              if(!fixtureCache.gc.enabled){
                skip(fixtureCache.gc.reason)
              }
              return fixtureCache.gc
            },
          }, { skip })
        } finally {
          postTestCallbacks.forEach(callback => callback())
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

const colors = {
  green: { dark: '#060', light: '#90e59a' },
  red: { dark: '#a00', light: '#f77' },
  yellow: { dark: '#777700', light: '#dd4' },
}


async function reportLogs (report) {
  const { body } = window.document
  const { reportType } = globalThis[Symbol.for('unit-test-info')]
  const svgPromise = createSVGResponse(report)
  const createElement = document.createElement.bind(document)
  if (reportType === 'badge') {
    const svg = await svgPromise
    body.innerHTML = svg
  } else {

    const tapDivs = report.tapReport.split('\n').map(line => {
      const div = createElement('div')
      const divClass = div.classList
      if(line.startsWith("ok") && line.includes("# SKIP ")){
        divClass.add("skipped")
      } else if(line.startsWith("ok")){
        divClass.add("passed")
      } else if(line.startsWith("not ok")){
        divClass.add("failed")
      } else if(/[0-9]+\.\.[0-9]+/.test(line)){
        divClass.add("plan")
      }

      if(line.includes("#")){
        const [text, ...comms] = line.split("#")
        const comments = comms.map(comm => "#" + comm).join('')
        div.textContent = text
        const span = createElement('span')
        span.classList.add("comment")
        span.textContent = comments
        span.innerHTML = span.innerHTML.replaceAll(" SKIP ", " <b>SKIP</b> ")
        div.append(span)
      } else {
        div.textContent = line
      }
      return div
    })

    const wrapLogs = (...content) => {
        const div = createElement('div')
    div.innerHTML = `
      <style>
    @scope {
      font-family:monospace;
      .passed { color: ${colors.green.dark}; }
      .skipped { color: ${colors.yellow.dark}; }
      .failed { color: ${colors.red.dark}; }
      .comment { color: #888; }
      .plan { font-weight: bold }
      @media (prefers-color-scheme: dark) {
        .passed { color: ${colors.green.light}; }
        .skipped { color: ${colors.yellow.light}; }
        .failed { color: ${colors.red.light}; }
      }
    }
  </style>
    `
    div.append(...content)
      return div
    }
    const tapReportDiv = wrapLogs(...tapDivs)
    tapReportDiv.classList.add("tap-report")

    const logDivs = report.logs.split('\n').map(log => {
      const div = createElement('div')
      div.textContent = log
      return div
    })

    const logReportDiv = wrapLogs(...logDivs)

    const summaryDivs = `
Tests
        Result: ${report.failed > 0 ? "FAIL" : "PASS"}
        Failed: ${report.failed}
        Passed: ${report.passed}
      Executed: ${report.tested}
       Skipped: ${report.skipped}
         Total: ${report.total}

Time Metrics

        Full test duration: ${report.timeMetrics.testDuration} milliseconds
  Duration since page load: ${report.timeMetrics.testDurationSinceLoad} milliseconds
    `.split('\n').map(log => {
      const pre = createElement('pre')
      pre.classList.toggle("passed", log.includes("PASS"))
      pre.classList.toggle("failed", log.includes("FAIL"))
      pre.textContent = log || " "
      pre.style.margin = "0"
      return pre
    })

    const summaryReportDiv = wrapLogs(...summaryDivs)


    const wrapIntoDetails = (summary, content, open = true) => {
      const tabLogs = createElement('details')
      tabLogs.open = open
      const tabLogsSummary = createElement('summary')
      tabLogsSummary.textContent = summary
      tabLogs.append(tabLogsSummary, content)
      return tabLogs
    }
    body.replaceChildren(
      wrapIntoDetails("Summary", summaryReportDiv),
      wrapIntoDetails("Logs", logReportDiv),
      wrapIntoDetails("TAP report", tapReportDiv)
    )
  }
  const inIframe = window.self !== window.top
  if (inIframe) {
    const svg = await svgPromise
    window.top.postMessage({ message: 'unit test report', data: report, badgeSvg: svg })
  }
}

let badgeFetch = null

const createSVGResponse = async (report) => {
  const label = `${report.passed} / ${report.tested}`
  const color = report.failed > 0 ? colors.red : colors.green
  const { badgeUrl } = globalThis[Symbol.for('unit-test-info')]
  badgeFetch ??= fetch(badgeUrl).then(response => response.text())
  const badgeSvg = await badgeFetch
  console.log(badgeSvg)

  const result = badgeSvg
    .replaceAll('IN BROWSER TESTS: RUNNING...', `IN BROWSER TESTS: ${label}`)
    .replaceAll(/textLength="[0-9]+" ([^>]+)>RUNNING.../g, `letter-spacing="30" $1>${label}`)
    .replaceAll(/--dark-fill: #[0-9a-fA-f]+; --light-fill: #[0-9a-fA-f]+;/g, `--dark-fill: ${color.dark}; --light-fill: ${color.light};`)
  console.log(result)
  return result
}
