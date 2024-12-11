/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const test = base.extend({
  step: async ({}, use) => {
    await use(test.step)
  },
  expect: async ({}, use) => {
    await use(expect)
  },

  page: async ({ browserName, page }, use) => {
    if (browserName !== 'chromium') {
      return await use(page)
    }

    await mkdir('reports/.tmp/coverage/ui/tmp', { recursive: true })

    await page.coverage.startJSCoverage()
    await use(page)
    const jsCoverage = await page.coverage.stopJSCoverage()

    const coverage = jsCoverage.map(entry => {
      const url = new URL(entry.url)
      const scriptPath = `file://${process.cwd() + url.pathname}`
      return {
        ...entry,
        url: scriptPath,
      }
    })

    for (const entry of coverage) {
      const filetoWrite = join(process.cwd(), `reports/.tmp/coverage/ui/tmp/coverage-ui-${Date.now()}-${entry.scriptId}.json`)
      const fileContent = JSON.stringify({ result: [entry] })
      await writeFile(filetoWrite, fileContent)
    }
  },
})
