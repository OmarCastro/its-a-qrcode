#!/usr/bin/env -S node --input-type=module
/*
This file is purposely large to easily move the code to multiple projects, its build code, not production.
To help navigate this file is divided by sections:
@section 1 init
@section 2 tasks
@section 3 jobs
@section 4 utils
@section 5 Dev Server
@section 6 linters
@section 7 minifiers
@section 8 exec utilities
@section 9 filesystem utilities
@section 10 npm utilities
@section 11 versioning utilities
@section 12 badge utilities
@section 13 module graph utilities
@section 14 docker utilities
@section 15 git utilities
@section 16 build tools plugins
*/
import process from 'node:process'
import fs, { readFile as fsReadFile, writeFile } from 'node:fs/promises'
import { resolve, basename, dirname, relative } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { execFile as baseExecFile, exec as baseExec, spawn } from 'node:child_process'
const exec = promisify(baseExec)
const execFile = promisify(baseExecFile)
const readFile = (path) => fsReadFile(path, { encoding: 'utf8' })
const exit = (exitCode) => {
  if (typeof exitCode === 'number') {
    process.exitCode = exitCode
  }
  setTimeout(() => {
    console.error('Force exit after timeout')
    process.exit()
  }, 10_000).unref()
}

// @section 1 init

const projectPathURL = new URL('../', import.meta.url)
const pathFromProject = (path) => new URL(path, projectPathURL).pathname
process.chdir(pathFromProject('.'))
let updateDevServer = () => {}

const configuration = {
  bundleDistName: 'qrcode.element.js',
}

configuration.minfiedBundleDistName ??= (({ bundleDistName: distName }) => {
  if (distName.endsWith('.min.js')) { return distName }
  if (distName.endsWith('.js')) { return distName.replace(/\.[^/.]+$/, '') + '.min.js' }
  return distName + '.min.js'
})(configuration)

// @section 2 tasks

const helpTask = {
  description: 'show this help',
  cb: () => { console.log(helpText()); exit(0) },
}
const tasks = {
  'build': {
    description: 'builds the project',
    cb: () => execBuild().then(exit),
  },
  'build:github-action': {
    description: 'runs build for github action',
    cb: () => execGithubBuildWorkflow().then(exit),
  },
  'test': {
    description: 'tests the project',
    cb: () => execTests().then(exit),
  },
  'test:unit-only': {
    description: 'quickly run unit tests of the project, showing a simple report, mostly used for precommit check',
    cb: () => quickRunUnitTests().then(exit),
  },
  'test:update-snapshots': {
    description: 'quickly run unit tests of the project, showing a simple report, mostly used for precommit check',
    cb: () => execTests({ updateSnapshots: true }).then(exit),
  },
  'test:in-host': {
    description: 'tests the project in current environment',
    cb: () => execTests({ inDocker: false }).then(exit),
  },
  'test:in-docker': {
    description: 'boots up a docker container and run tests there',
    cb: () => execTests({ inDocker: true }).then(exit),
  },
  'linc': {
    description: 'validates only changed files',
    cb: () => execlintCodeOnChanged().then(exit),
  },
  'lint': {
    description: 'validates the project',
    cb: () => execlintCode().then(exit),
  },
  'format': {
    description: 'format the project code',
    cb: () => execFormatCode().then(exit),
  },
  'formac': {
    description: 'formats only changed files code',
    cb: () => execFormatCodeOnChanged().then(exit),
  },
  'dev': {
    description: 'setup dev environment',
    cb: () => execDevEnvironment(),
  },
  'dev:open': {
    description: 'setup dev environment and opens dev server in browser',
    cb: () => execDevEnvironment({ openBrowser: true }),
  },
  'dev-server': {
    description: 'launch dev server',
    cb: async () => { await openDevServer(); await wait(2 ** 30) },
  },
  'dev-server:open': {
    description: 'launch dev server and opens in browser',
    cb: async () => { await openDevServer({ openBrowser: true }); await wait(2 ** 30) },
  },
  'test-server': {
    description: 'launch test server, used when running tests',
    cb: async () => { await openTestServer(); await wait(2 ** 30) },
  },
  'release:prepare': {
    description: 'builds the project and prepares it for release',
    cb: async () => { prepareRelease().then(exit) },
  },
  'release:clean': {
    description: 'clean release preparation',
    cb: async () => { cleanRelease().then(exit) },
  },
  'pre-commit-check': {
    description: 'executes pre-commit validation, validates the project with the staged changes only',
    cb: () => preCommitCheck().then(exit),
  },
  'commit-msg-check': {
    description: 'executes commit message validation',
    cb: () => commitMsgCheck().then(exit),
  },
  'help': helpTask,
  '--help': helpTask,
  '-h': helpTask,
}

async function main () {
  const args = process.argv.slice(2)
  if (args.length <= 0) {
    console.log(helpText())
    return exit(0)
  }

  const taskName = args[0]

  if (!Object.hasOwn(tasks, taskName)) {
    console.error(`unknown task ${taskName}\n\n${helpText()}`)
    return exit(1)
  }

  const isInsideDocker = await isInsideDockerContainer()
  if (!isInsideDocker) {
    await checkGitHooks()
  }
  await checkNodeModulesFolder()
  await tasks[taskName].cb()
}

await main()

// @section 3 jobs

async function execDevEnvironment ({ openBrowser = false } = {}) {
  await openDevServer({ openBrowser })
  await Promise.all([execlintCodeOnChanged(), buildTest()])
  const testTask = (await isDockerRunning()) ? testInDocker : execTests

  await testTask()
  await buildDocs()

  const srcPath = pathFromProject('src')
  const docsPath = pathFromProject('docs')
  const testUtilsPath = pathFromProject('test-utils')

  const watcher = watchDirs(srcPath, docsPath, testUtilsPath)

  for await (const change of watcher) {
    const { filenames } = change
    console.log(`\n[watcher] files changed: ${JSON.stringify(filenames, null, 2)}\n\n`)
    let tasks = []
    if (Object.keys(filenames).some(name => name.endsWith('test-page.html') || name.startsWith(srcPath))) {
      tasks = [execlintCodeOnChanged, buildTest, testTask, buildDocs]
    } else {
      tasks = [execlintCodeOnChanged, buildTest, buildDocs]
    }

    for (const task of tasks) {
      try {
        await task()
      } catch (e) {
        console.error(e)
        break
      }
    }
    updateDevServer()
  }
}

async function quickRunUnitTests () {
  logStartStage('test', 'quick build & run unit tests')
  await buildUnitTests()
  const result = await cmdSpawn('TZ=UTC node build/tests/run-unit-tests.js')
  logEndStage()
  return result
}

async function execTests ({ inDocker, updateSnapshots = false } = {}) {
  const isInsideDocker = await isInsideDockerContainer()
  if (inDocker === true && isInsideDocker) {
    console.error('[ERROR] trying to run test in a docker container inside a docker container, aborting')
    return 1
  } else if (inDocker === true) {
    await testInDocker({ updateSnapshots })
  } else if (inDocker === false) {
    await runTestProcedure({ updateSnapshots })
  } else if (isInsideDocker || !(await isDockerRunning())) {
    await runTestProcedure({ updateSnapshots })
  } else {
    await testInDocker({ updateSnapshots })
  }
  return 0
}

async function runTestProcedure ({ updateSnapshots = false }) {
  const COVERAGE_DIR = 'reports/coverage'
  const REPORTS_TMP_DIR = 'reports/.tmp'
  const COVERAGE_TMP_DIR = `${REPORTS_TMP_DIR}/coverage`
  const FINAL_COVERAGE_TMP_DIR = `${COVERAGE_TMP_DIR}/final`
  const COVERAGE_BACKUP_DIR = 'reports/coverage.bak'

  const COVERAGE_REPORTERS = '--reporter json-summary --reporter html --reporter lcov '
  const UNIT_COVERAGE_INCLUDES = '--include "src/**/*.{js,ts}" --exclude "src/**/*.{test,spec,d}.{js,ts}" --exclude="src/entrypoint/node.js"'
  const UI_COVERAGE_INCLUDES = `--include build/src-dist/${configuration.minfiedBundleDistName}`

  logStartStage('test', 'run tests')

  await cmdSpawn(`TZ=UTC npx c8 --all ${UNIT_COVERAGE_INCLUDES} --temp-directory ".tmp/coverage" --report-dir reports/.tmp/coverage/unit ${COVERAGE_REPORTERS} playwright test${updateSnapshots ? ' -u' : ''}`)

  await rm_rf(FINAL_COVERAGE_TMP_DIR)
  await mkdir_p(FINAL_COVERAGE_TMP_DIR)
  await cp_R('.tmp/coverage', `${FINAL_COVERAGE_TMP_DIR}/tmp`)
  const uiTestsExecuted = existsSync('reports/.tmp/coverage/ui/tmp')
  if (uiTestsExecuted) {
    await cp_R('reports/.tmp/coverage/ui/tmp', FINAL_COVERAGE_TMP_DIR)
    await cmdSpawn(`TZ=UTC npx c8  --all ${UI_COVERAGE_INCLUDES} ${COVERAGE_REPORTERS} --report-dir reports/.tmp/coverage/ui report`)
    logStage('merge unit & ui coverage reports')
  }
  await cmdSpawn(`TZ=UTC npx c8 --all ${UNIT_COVERAGE_INCLUDES} ${UI_COVERAGE_INCLUDES} ${COVERAGE_REPORTERS} --report-dir reports/.tmp/coverage/final report`)

  if (existsSync(COVERAGE_DIR)) {
    await rm_rf(COVERAGE_BACKUP_DIR)
    await mv(COVERAGE_DIR, COVERAGE_BACKUP_DIR)
  }
  await mv(COVERAGE_TMP_DIR, COVERAGE_DIR)
  logStage('cleanup coverage info')

  await Promise.allSettled([
    rm_rf(REPORTS_TMP_DIR),
    rm_rf(COVERAGE_BACKUP_DIR),
  ])
  logStage('build badges')

  await Promise.all([
    makeBadgeForCoverages(pathFromProject('reports/coverage/unit')),
    makeBadgeForCoverages(pathFromProject('reports/coverage/final')),
    makeBadgeForTestResult(pathFromProject('reports/test-results')),
    makeBadgeForLicense(pathFromProject('reports')),
    makeBadgeForNPMVersion(pathFromProject('reports')),
    makeBadgeForRepo(pathFromProject('reports')),
    makeBadgeForRelease(pathFromProject('reports')),
    ...(uiTestsExecuted ? [makeBadgeForCoverages(pathFromProject('reports/coverage/ui'))] : []),
  ])

  logStage('fix report styles')
  const files = await getFilesAsArray('reports/coverage/final')
  const cpBase = files.filter(path => basename(path) === 'base.css').map(path => fs.cp('buildfiles/assets/coverage-report-base.css', path))
  const cpPrettify = files.filter(path => basename(path) === 'prettify.css').map(path => fs.cp('buildfiles/assets/coverage-report-prettify.css', path))
  await Promise.allSettled([...cpBase, ...cpPrettify])

  logStage('copy reports to documentation')
  await rm_rf('build/docs/reports')
  await mkdir_p('build/docs')
  await cp_R('reports', 'build/docs/reports')
  logEndStage()
}

async function testInDocker ({ updateSnapshots = false } = {}) {
  const { userInfo } = await import('node:os')
  const { uid, gid } = userInfo()
  const playwrightVersion = await getPlayWrightVersion()
  const imageName = 'mcr.microsoft.com/playwright:v' + playwrightVersion
  const workdir = '/playwright'
  return await runInDocker({
    command: updateSnapshots ? 'node buildfiles/run.js test:update-snapshots' : 'node buildfiles/run.js test',
    rmOnFinish: true,
    imageName,
    user: `${uid}:${gid}`,
    workdir,
    volumes: {
      [pathFromProject('.')]: workdir,
    },
  })
}

/**
 * @returns {import('esbuild').BuildOptions} common build option for esbuild
 */
function esBuildCommonParams () {
  return {
    target: ['es2022'],
    bundle: true,
    minify: false,
    sourcemap: false,
    absWorkingDir: pathFromProject('.'),
    logLevel: 'info',
  }
}

async function buildTest () {
  logStartStage('build:test', 'bundle')

  const esbuild = await import('esbuild')

  const commonBuildParams = esBuildCommonParams()

  const buildPath = 'build'
  const esmDistPath = `${buildPath}/dist/esm`
  const minDistPath = `${buildPath}/dist`
  const docsPath = `${buildPath}/docs`
  const docsEsmDistPath = `${docsPath}/dist/esm`
  const minSrcDistPath = `${buildPath}/src-dist`

  await buildESM(esmDistPath)
  await buildESM(docsEsmDistPath)

  /**
   * Builds minified files mapped from ESM, as it is most likely used in production.
   */
  const buildDistFromEsm = esbuild.build({
    ...commonBuildParams,
    entryPoints: [`${esmDistPath}/entrypoint/browser.js`],
    outfile: `${minDistPath}/${configuration.minfiedBundleDistName}`,
    format: 'esm',
    sourcemap: true,
    minify: true,
  })

  /**
   * Builds minified files mapped from the original source code.
   * This will the correct mapping to the original code path. With
   * it the test code coverage will be correct when merging unit tests
   * and UI tests.
   */
  const buildSrcDist = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['src/entrypoint/browser.js'],
    outfile: `${minSrcDistPath}/${configuration.minfiedBundleDistName}`,
    format: 'esm',
    sourcemap: true,
    metafile: true,
    minify: true,
    plugins: [await getESbuildPlugin()],
  })

  await Promise.all([buildDistFromEsm, buildSrcDist])

  await cp_R(minDistPath, docsPath)
  const metafile = (await buildSrcDist).metafile
  await mkdir_p('reports')
  logStage('generating module graph')
  await writeFile('reports/module-graph.json', JSON.stringify(metafile, null, 2))
  const svg = await createModuleGraphSvg(metafile)
  await writeFile('reports/module-graph.svg', svg)
  logStage('build test page html')

  await exec(`${process.argv[0]} buildfiles/scripts/build-html.js test-page.html`)

  await buildUnitTests({ includeBrowser: true })

  logEndStage()
}

async function buildDocs () {
  logStartStage('build:docs', 'build docs')

  const esbuild = await import('esbuild')
  const commonBuildParams = esBuildCommonParams()

  const buildPath = 'build'
  const docsPath = `${buildPath}/docs`

  /**
   * Builds documentation specific JS code
   */
  const buildDocsJS = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['docs/doc.js'],
    outdir: docsPath,
    splitting: true,
    chunkNames: 'chunk/[name].[hash]',
    format: 'esm',
    plugins: [await getESbuildPlugin()],
  })

  /**
   * Builds documentation styles
   */
  const buildDocsStyles = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['docs/doc.css'],
    outfile: `${docsPath}/doc.css`,
  })

  await Promise.all([
    buildDocsJS, buildDocsStyles,
    fs.cp('docs/favicon.png', `${docsPath}/favicon.png`),
    exec(`${process.argv[0]} buildfiles/scripts/build-html.js index.html`),
    exec(`${process.argv[0]} buildfiles/scripts/build-html.js contributing.html`),
  ])

  logEndStage()
}

/**
 * @param {string} outputDir - output dir to compile to
 */
async function buildESM (outputDir) {
  const esbuild = await import('esbuild')

  const fileListJS = await listNonIgnoredFiles({ patterns: ['src/**/!(*.spec).js'] })
  const fileListJsJob = fileListJS.map(async (path) => {
    const js = readFileSync(path).toString()
    const updatedJs = js
      .replaceAll('.element.html"', '.element.html.generated.js"')
      .replaceAll(".element.html'", ".element.html.generated.js'")
      .replaceAll('.element.css"', '.element.css.generated.js"')
      .replaceAll(".element.css'", ".element.css.generated.js'")
      .replaceAll('.inline.html"', '.inline.html.generated.js"')
      .replaceAll(".inline.html'", ".inline.html.generated.js'")
      .replaceAll('.inline.css"', '.inline.css.generated.js"')
      .replaceAll(".inline.css'", ".inline.css.generated.js'")

    const noSrcPath = path.split('/').slice(1).join('/')
    const outfile = pathFromProject(`${outputDir}/${noSrcPath}`)
    const outdir = dirname(outfile)
    if (!existsSync(outdir)) { await mkdir_p(outdir) }
    return fs.writeFile(outfile, updatedJs)
  })

  const fileListCSS = await listNonIgnoredFiles({ patterns: ['src/**/*.element.css', 'src/**/*.inline.css'] })
  const fileListCssJob = fileListCSS.map(async (path) => {
    const minCss = await minifyCss(await readFile(path))
    const minCssJs = await esbuild.transform(minCss, { loader: 'text', format: 'esm' })
    const noSrcPath = path.split('/').slice(1).join('/')
    const outfile = pathFromProject(`${outputDir}/${noSrcPath}.generated.js`)
    const outdir = dirname(outfile)
    if (!existsSync(outdir)) { await mkdir_p(outdir) }
    return fs.writeFile(outfile, `// generated code from ${path}\n${minCssJs.code}`)
  })

  const fileListHtml = await listNonIgnoredFiles({ patterns: ['src/**/*.element.html', 'src/**/*.inline.html'] })
  const fileListHtmlJob = fileListHtml.map(async (path) => {
    const minHtml = await minifyHtml(await readFile(path))
    const minHtmlJs = await esbuild.transform(minHtml, { loader: 'text', format: 'esm' })
    const noSrcPath = path.split('/').slice(1).join('/')
    const outfile = pathFromProject(`${outputDir}/${noSrcPath}.generated.js`)
    const outdir = dirname(outfile)
    if (!existsSync(outdir)) { await mkdir_p(outdir) }
    return fs.writeFile(outfile, `// generated code from ${path}\n${minHtmlJs.code}`)
  })

  await Promise.all([...fileListJsJob, ...fileListCssJob, ...fileListHtmlJob])
}

async function buildUnitTests ({ includeBrowser = false } = {}) {
  const toImportCode = (outputPathFolder, file) => {
    const importPath = relative(outputPathFolder, file)
    return `import ${JSON.stringify(importPath)}\n`
  }

  const unitTestFiles = await listNonIgnoredFiles({ patterns: ['*.unit.spec.js'] })

  const outputs = [{
    setupPath: 'test-utils/unit/setup-unit-test-systems.js',
    outputPath: 'build/tests/run-unit-tests.js',
  }, {
    setupPath: 'test-utils/unit/setup-unit-test-browser.js',
    outputPath: 'build/tests/run-unit-tests--browser.js',
  }, {
    setupPath: 'test-utils/unit/setup-unit-test-browser.js',
    outputPath: 'build/docs/tests/unit-tests.js',
  }]

  const unitTestRunnerAssets = {
    html: null,
    badge: null,
  }

  await Promise.all(outputs.map(async ({ setupPath, outputPath }) => {
    const isBrowser = setupPath === 'test-utils/unit/setup-unit-test-browser.js'
    if (isBrowser && !includeBrowser) {
      return
    }
    const outputPathFolder = dirname(outputPath)
    const outputPathNoExtension = outputPath.slice(0, outputPath.lastIndexOf('.'))
    const outputPathMinified = outputPathNoExtension + '.min.js'
    await mkdir_p(outputPathFolder)

    const testSetupCode = toImportCode(outputPathFolder, setupPath)
    const testFileImports = unitTestFiles.map(file => toImportCode(outputPathFolder, file)).join('')
    const code = testSetupCode + testFileImports
    await writeFile(outputPath, code)
    if (!isBrowser) {
      return
    }

    const esbuild = await import('esbuild')
    await esbuild.build({
      ...esBuildCommonParams(),
      entryPoints: [outputPath],
      outfile: outputPathMinified,
      platform: isBrowser ? 'browser' : 'node',
      format: 'esm',
      minify: true,
    })

    unitTestRunnerAssets.html ??= readFile('./buildfiles/assets/unit-test-runner-page.html')
    const htmlOutputPath = outputPathNoExtension + '.html'
    const badgeOutputPath = outputPathNoExtension + '.badge.svg'
    const htmlContent = (await unitTestRunnerAssets.html)
      .replaceAll('{{test-run-script}}', relative(outputPathFolder, outputPathMinified))
      .replaceAll('{{badge-img-href}}', relative(outputPathFolder, badgeOutputPath))
    await writeFile(htmlOutputPath, htmlContent)
    unitTestRunnerAssets.badge ??= await (async () => {
      const svg = await makeBadge({
        label: 'in browser tests',
        message: 'Running...',
        color: getBadgeColors().blue,
        logo: asciiIconSvg('✔'),
      })

      return await applyA11yTheme(svg, { replaceIconToText: '✔' })
    })()

    await writeFile(badgeOutputPath, unitTestRunnerAssets.badge)
  }))
}

async function execBuild () {
  await buildTest()
  await buildDocs()
}

async function execlintCodeOnChanged () {
  logStartStage('linc', 'fetching changed files')
  const changedFiles = await listChangedFiles()
  logStage('lint using eslint')
  const returnCodeLint = await lintCode({ onlyChanged: true, changedFiles }, { fix: true })
  logStage('spell check')
  const returnCheckSpelling = await checkSpelling({ onlyChanged: true, changedFiles })
  logStage('lint using stylelint')
  const returnStyleLint = await lintStyles({ onlyChanged: true, changedFiles })
  logStage('validating json')
  const returnJsonLint = await validateJson({ onlyChanged: true, changedFiles })
  logStage('validating yaml')
  const returnYamlLint = await validateYaml({ onlyChanged: true, changedFiles })
  logStage('typecheck')
  const returnTypecheck = await typecheckSrc({ onlyChanged: true, changedFiles })
  logEndStage()
  return returnCodeLint + returnTypecheck + returnStyleLint + returnJsonLint + returnYamlLint + returnCheckSpelling
}

async function execlintCode () {
  logStartStage('lint', 'lint using eslint')
  const returnCodeLint = await lintCode({ onlyChanged: false }, { fix: true })
  logStage('spell check')
  const returnCheckSpelling = await checkSpelling({ onlyChanged: false })
  logStage('lint using stylelint')
  const returnStyleLint = await lintStyles({ onlyChanged: false })
  logStage('validating json')
  const returnJsonLint = await validateJson({ onlyChanged: false })
  logStage('validating yaml')
  const returnYamlLint = await validateYaml({ onlyChanged: false })
  logStage('typecheck')
  const returnTypecheck = await typecheckSrc({ onlyChanged: false })
  logEndStage()
  return returnCodeLint + returnTypecheck + returnStyleLint + returnJsonLint + returnYamlLint + returnCheckSpelling
}

async function execFormatCode () {
  logStartStage('format', 'formatting code')
  const returnCodeLint = await formatCode({ onlyChanged: false })
  logEndStage()
  return returnCodeLint
}

async function execFormatCodeOnChanged () {
  logStartStage('formac', 'formatting changed code')
  const returnCodeLint = await formatCode({ onlyChanged: true })
  logEndStage()
  return returnCodeLint
}

async function preCommitCheck () {
  logStartStage('precommit', 'lint and test')

  const result = await executeOnStagedOnly(async () => {
    const testTask = quickRunUnitTests()
    const codeLint = execlintCodeOnChanged()
    const testVersionAlign = alignTestFrameworkVersion()
    const exitCodes = await Promise.all([testTask, codeLint, testVersionAlign])
    const exitCode = exitCodes.reduce((a, b) => a + b)
    return exitCode
  })
  logEndStage()
  return result
}

async function commitMsgCheck () {
  console.log('[commitmsg] validating commit message')
  const args = process.argv.slice(3)
  const commitFile = args[0]
  const commitMessage = readFileSync(commitFile)
  const regex = /(((build|chore|ci|docs|feat|fix|perf|ops|refactor|revert|style|test|review|rebase|release)(\(.*\))?!?:)) (.|\s|\r|\n)+/
  let result = 0
  if (!regex.test(commitMessage)) {
    console.error('[commitmsg] ERROR: Commit message is not following the Conventional Commit standard. expected one of the follwing prefixes: ' +
      'build, chore, ci,docs, feat, fix, perf, ops, refactor, revert, style, test, review, rebase, release')
    result = 1
  }
  return result
}

async function execGithubBuildWorkflow () {
  logStartStage('build:github')
  await buildTest()
  await execTests()
  await buildDocs()
}

async function prepareRelease () {
  await cleanRelease()
  logStartStage('release:prepare', 'check version')
  const publishedVersion = await getLatestPublishedVersion()
  const packageJson = getPackageJson()
  const currentVersion = packageJson.version

  const { gt } = await import('semver')
  if (publishedVersion !== 'unreleased' && !gt(currentVersion, publishedVersion)) {
    throw Error(`current version (${currentVersion}) must be higher than latest published version (${publishedVersion})`)
  }
  logEndStage()
  await buildTest()
  await execTests()
  await buildDocs()
  logStartStage('release:prepare', 'create dist')
  await cp_R('build/dist', 'dist')
  logStage('create package')
  mkdir_p('package/content')
  await cp_R('dist', 'package/content/dist')
  await cp_R('README.md', 'package/content/README.md')
  await cp_R('LICENSE', 'package/content/LICENSE')
  const files = (await getFilesAsArray('src')).map(path => relative(pathFromProject('.'), path))
  await Promise.all(files.filter(path => !path.includes('.spec.')).map(path => fs.cp(path, `package/content/${path}`)))
  const releasePackageJson = { ...packageJson, devDependencies: undefined, scripts: undefined, directories: undefined, imports: undefined }
  await writeFile('package/content/package.json', JSON.stringify(releasePackageJson, null, 2))
  await cmdSpawn('npm pack --pack-destination "' + pathFromProject('package') + '"', { cwd: pathFromProject('package/content') })
  logEndStage()
}

async function cleanRelease () {
  logStartStage('release:clean', 'remove dist')
  await rm_rf('dist')
  await rm_rf('package')
  logEndStage()
}

async function alignTestFrameworkVersion () {
  const playwrightVersion = await getPlayWrightVersion()
  const files = await listNonIgnoredFiles({ patterns: ['.github/workflows/*.yaml', '.github/workflows/*.yml'] })
  const regexp = /(?<=mcr\.microsoft\.com\/playwright:v)(?<version>[.0-9]+)/g
  const result = await Array.fromAsync(files.map(async (file) => {
    const data = await readFile(file)
    const updatedData = data.replaceAll(regexp, playwrightVersion)
    if (updatedData !== data) {
      await writeFile(file, updatedData)
      return file
    }
    return ''
  }))
  const updatedFiles = result.filter(Boolean)
  if (updatedFiles.length) {
    console.log('updated playwright version on files: %s', updatedFiles)
  }
  return 0
}

// @section 4 utils

function helpText () {
  const fromNPM = isRunningFromNPMScript()

  const helpArgs = fromNPM ? 'help' : 'help, --help, -h'
  const maxTaskLength = Math.max(...[helpArgs, ...Object.keys(tasks)].map(text => text.length))
  const tasksToShow = Object.entries(tasks).filter(([, value]) => value !== helpTask)
  const usageLine = fromNPM ? 'npm run <task>' : 'run <task>'
  return `Usage: ${usageLine}

Tasks:
  ${tasksToShow.map(([key, value]) => `${key.padEnd(maxTaskLength, ' ')}  ${value.description}`).join('\n  ')}
  ${'help, --help, -h'.padEnd(maxTaskLength, ' ')}  ${helpTask.description}`
}

/** @param {string[]} paths - paths to remove recursively */
async function rm_rf (...paths) {
  await Promise.all(paths.map(path => fs.rm(path, { recursive: true, force: true })))
}

/** @param {string[]} paths - paths to recursively create directories */
async function mkdir_p (...paths) {
  await Promise.all(paths.map(path => fs.mkdir(path, { recursive: true })))
}

/**
 * @param {string} src - source;
 * @param {string} dest - destination
 */
async function cp_R (src, dest) {
  await cmdSpawn(`cp -r '${src}' '${dest}'`)

  // the next command is 1000 times slower that running the command, for that reason it is not used (30 000ms vs 30ms)
  // await fs.cp(src, dest, { recursive: true })
}

async function mv (src, dest) {
  await fs.rename(src, dest)
}

function logStage (stage) {
  logEndStage(); logStartStage(logStage.currentJobName, stage)
}

function logEndStage () {
  const startTime = logStage.perfMarks[logStage.currentMark]
  console.log(startTime ? `done (${Date.now() - startTime}ms)` : 'done')
}

function logStartStage (jobname, stage) {
  const markName = 'stage ' + stage
  logStage.currentJobName = jobname
  logStage.currentMark = markName
  logStage.perfMarks ??= {}
  stage && process.stdout.write(`[${jobname}] ${stage}...`)
  logStage.perfMarks[logStage.currentMark] = Date.now()
}

// @section 5 Dev server

async function openDevServer ({ openBrowser = false } = {}) {
  const { Server } = await import('./scripts/dev-server.js')

  const host = 'localhost'
  const port = 8181

  const server = Server()
  server.listen(port)
  updateDevServer = server.update

  if (openBrowser) {
    const { default: open } = await import('open')
    open(`https://${host}:${port}/build/docs`)
  }
}

async function openTestServer () {
  const { TestServer } = await import('./scripts/dev-server.js')

  const port = 8182

  TestServer().listen(port)
}

function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// @section 6 linters & formatters

async function lintCode ({ onlyChanged, changedFiles }, options = {}) {
  const finalFilePatterns = await listFileByLinterParams({ patterns: ['**/*.js'], onlyChanged, changedFiles })
  if (finalFilePatterns.length <= 0) {
    process.stdout.write('no files to lint. ')
    return 0
  }
  const config = (await import('./configs/eslint.config.js')).default

  const { ESLint } = await import('eslint')
  const eslint = new ESLint({
    baseConfig: config,
    cache: true,
    cacheLocation: pathFromProject('.tmp/eslintcache'),
    ...options,
  })
  const formatter = await eslint.loadFormatter()
  const results = await eslint.lintFiles(finalFilePatterns)

  if (options != null && options.fix === true) {
    await ESLint.outputFixes(results)
  }

  const filesLinted = results.length
  process.stdout.write(`linted ${filesLinted} files. `)

  const errorCount = results.reduce((acc, result) => acc + result.errorCount, 0)

  const resultLog = formatter.format(results)
  if (resultLog) {
    console.log('')
    console.log(resultLog)
  } else {
    process.stdout.write('OK...')
  }
  return errorCount ? 1 : 0
}

async function checkSpelling ({ onlyChanged, changedFiles }) {
  const { load } = await import('js-yaml')

  const configPath = pathFromProject('./buildfiles/configs/cspell.yaml')
  const config = load(await readFile(configPath))
  const ignorePaths = config.ignorePaths ?? []
  const fileList = await listFileByLinterParams({ patterns: ['*'], ignorePatterns: ignorePaths, onlyChanged, changedFiles })

  if (fileList.length <= 0) {
    process.stdout.write('no files to spell check. ')
    return 0
  }

  const { lint, getDefaultReporter } = await import('cspell')
  const options = {
    cache: false,
    color: false,
    showPerfSummary: true,
    issues: true,
  }

  const reporter = getDefaultReporter(options)

  const results = await lint(fileList, {
    config: pathFromProject('./buildfiles/configs/cspell.yaml'),
    cache: true,
    cacheLocation: '.tmp/cspellcache',
  }, reporter)

  const filesLinted = results.files
  process.stdout.write(`checked ${filesLinted} files. `)

  const errorCount = results.errors

  if (errorCount <= 0) {
    process.stdout.write('OK...')
  }
  return errorCount ? 1 : 0
}

async function lintStyles ({ onlyChanged, changedFiles }) {
  const fileList = await listFileByLinterParams({ patterns: ['**/*.css'], onlyChanged, changedFiles })
  if (fileList.length <= 0) {
    process.stdout.write('no stylesheets to lint. ')
    return 0
  }
  const { default: stylelint } = await import('stylelint')
  const result = await stylelint.lint({ files: fileList, configFile: 'buildfiles/configs/.stylelintrc.yaml', ignorePath: '.gitignore' })
  const filesLinted = result.results.length
  process.stdout.write(`linted ${filesLinted} files. `)
  const stringFormatter = await stylelint.formatters.tap

  const output = stringFormatter(result.results)
  if (output) {
    console.log('\n' + output)
  } else {
    process.stdout.write('OK...')
  }

  return result.errored ? 1 : 0
}

async function validateJson ({ onlyChanged, changedFiles }) {
  return await validateFiles({
    patterns: ['*.json'],
    onlyChanged,
    changedFiles,
    validation: async (file) => JSON.parse(await readFile(file)),
  })
}

async function validateYaml ({ onlyChanged, changedFiles }) {
  const { load } = await import('js-yaml')
  return await validateFiles({
    patterns: ['*.yml', '*.yaml'],
    onlyChanged,
    changedFiles,
    validation: async (file) => load(await readFile(file)),
  })
}

async function typecheckSrc ({ onlyChanged, changedFiles }) {
  if (onlyChanged) {
    const changedInSrc = [...changedFiles].some(changedFile => changedFile.startsWith('src/'))
    if (!changedInSrc) {
      process.stdout.write('no files to check...')
      return 0
    }
  }
  return await cmdSpawn('npx tsc --noEmit -p jsconfig.json')
}

async function formatCode ({ onlyChanged, changedFiles }) {
  const finalFilePatterns = await listFileByLinterParams({ patterns: ['**/*.js'], onlyChanged, changedFiles })
  if (finalFilePatterns.length <= 0) {
    process.stdout.write('no files to lint. ')
    return 0
  }

  const config = (await import('./configs/eslint.stylistic.config.js')).default

  const { ESLint } = await import('eslint')
  const eslint = new ESLint({
    baseConfig: config,
    fix: true,
  })

  const formatter = await eslint.loadFormatter()
  const results = await eslint.lintFiles(finalFilePatterns)
  await ESLint.outputFixes(results)

  const filesLinted = results.length
  process.stdout.write(`formatted ${filesLinted} files. `)

  const errorCount = results.reduce((acc, result) => acc + result.errorCount, 0)

  const resultLog = formatter.format(results)
  if (resultLog) {
    console.log('')
    console.log(resultLog)
  } else {
    process.stdout.write('OK...')
  }
  return errorCount ? 1 : 0
}

async function validateFiles ({ patterns, onlyChanged, changedFiles, validation }) {
  const fileList = await listFileByLinterParams({ patterns, onlyChanged, changedFiles })
  if (fileList.length <= 0) {
    process.stdout.write('no files to lint. ')
    return 0
  }
  let errorCount = 0
  const outputLines = []
  for (const file of fileList) {
    try {
      await validation(file)
    } catch (e) {
      errorCount++
      outputLines.push(`error in file "${file}": ${e.message}`)
    }
  }
  process.stdout.write(`validated ${fileList.length} files. `)
  const output = outputLines.join('\n')
  if (output) {
    console.log('\n' + outputLines)
  } else {
    process.stdout.write('OK...')
  }

  return errorCount ? 1 : 0
}

// @section 7 minifiers

async function minifyHtml (htmlText) {
  const { DOMParser } = await loadDom()
  const parsed = new DOMParser().parseFromString(htmlText, 'text/html')
  await minifyDOM(parsed.documentElement)

  const fullpageRegexCheck = /^<(!doctype\s+)?html/i
  if (fullpageRegexCheck.test(htmlText)) {
    return parsed.documentElement.outerHTML
  }
  return parsed.head.innerHTML + parsed.body.innerHTML
}

async function minifyCss (cssText) {
  const esbuild = await import('esbuild')
  const result = await esbuild.transform(cssText, { loader: 'css', minify: true })
  return result.code
}

async function minifyDOM (domElement) {
  const { window } = await loadDom()
  const { TEXT_NODE, ELEMENT_NODE, COMMENT_NODE } = window.Node

  const defaultMinificationState = { whitespaceMinify: '1-space' }
  const initialMinificationState = updateMinificationStateForElement(domElement, defaultMinificationState)
  walkElementMinification(domElement, initialMinificationState)
  return domElement

  /**
   * Updates minification state for each element
   * @param {Element} element - target element
   * @param {MinificationState} minificationState - previous minification state
   * @returns {MinificationState} next minification State
   */
  function updateMinificationStateForElement (element, minificationState) {
    switch (element.tagName.toLowerCase()) {
      // by default, <pre> renders whitespace as is, so we do not want to minify in this case
      case 'pre': return { ...minificationState, whitespaceMinify: 'pre' }
      // <html> and <head> are not rendered in the viewport, so we remove all blank text nodes
      case 'html':
      case 'head': return { ...minificationState, whitespaceMinify: 'remove-blank' }
      // in the <body>, the default whitespace behaviour is to merge multiple whitespaces to 1,
      // there will stil have some whitespace that will be merged, but at this point, there is
      // little benefit to remove even more duplicated whitespace
      case 'body': return { ...minificationState, whitespaceMinify: '1-space' }
      default: return minificationState
    }
  }

  /**
   * @param {Element} currentElement - current element to minify
   * @param {MinificationState} minificationState - current minificationState
   */
  function walkElementMinification (currentElement, minificationState) {
    if (currentElement.tagName.toLowerCase() === 'template') {
      /*
        <template> elemetnt works differently from other components.
        It has no permitted content, so it does not have child nodes,
        (`Node.childNodes` property of a <template> element is always empty)
        we have to minify the innerHTML instead
      */
      const div = currentElement.ownerDocument.createElement('div')
      div.append(currentElement.content)
      walkElementMinification(div, minificationState)
      currentElement.innerHTML = div.innerHTML
      return
    }
    const { whitespaceMinify } = minificationState
    const childNodes = currentElement?.childNodes?.values()
    if (!childNodes) { return }
    // we have to make a copy of the iterator for traversal, because we cannot
    // iterate through what we'll be modifying at the same time
    const values = Array.from(childNodes)
    for (const node of values) {
      if (node.nodeType === COMMENT_NODE) {
        node.remove()
      } else if (node.nodeType === TEXT_NODE) {
        minifyTextNode(node, whitespaceMinify)
      } else if (node.nodeType === ELEMENT_NODE) {
        const updatedState = updateMinificationStateForElement(node, minificationState)
        walkElementMinification(node, updatedState)
      }
    }
  }

  /**
   * Minify a DOM text node based con current minification status
   * @param {ChildNode} node - current text node
   * @param {WhitespaceMinify} whitespaceMinify - whitespace minification removal method
   */
  function minifyTextNode (node, whitespaceMinify) {
    if (whitespaceMinify === 'pre') {
      return
    }
    // blank node is empty or contains whitespace only, so we remove it
    const isBlankNode = !/[^\s]/.test(node.nodeValue)
    if (isBlankNode && whitespaceMinify === 'remove-blank') {
      node.remove()
      return
    }
    if (whitespaceMinify === '1-space') {
      node.nodeValue = node.nodeValue.replace(/\s\s+/g, ' ')
    }
  }

  /** @typedef {"remove-blank" | "1-space" | "pre"} WhitespaceMinify */
  /**
   * @typedef {object} MinificationState
   * @property {WhitespaceMinify} whitespaceMinify - current whitespace minification method
   */
}

// @section 8 exec utilities

/**
 * @param {string} command - shell command to execute
 * @param {import('node:child_process').ExecFileOptions} options - execFile options
 * @returns {Promise<number>} code exit
 */
function cmdSpawn (command, options = {}) {
  const p = spawn('/bin/sh', ['-c', command], { stdio: 'inherit', ...options })
  return new Promise(resolve => { p.on('exit', resolve) })
}

async function execCmd (command, args) {
  const options = {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  }
  return await execFile(command, args, options)
}

// @section 9 filesystem utilities

async function * getFiles (dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield * getFiles(res)
    } else {
      yield res
    }
  }
}

async function getFilesAsArray (dir) {
  const arr = []
  for await (const i of getFiles(dir)) { arr.push(i) }
  return arr
}

/**
 *
 * @param  {...string} dirs - list of dir paths to watch, they must be full paths
 * @yields {Promise<{filenames: string[]}>}
 * @returns {AsyncGenerator<Promise<{filenames: string[]}>>} iterator of changed filenames
 */
async function * watchDirs (...dirs) {
  const { watch } = await import('node:fs')
  const { join } = await import('node:path')
  const nothingResolver = () => {}
  let currentResolver = nothingResolver
  let batch = {}
  console.log(`watching ${dirs}`)

  /** @type {(dir:string) => import('node:fs').WatchListener<string>} */
  const handler = (dir) => (eventType, filename) => {
    if (eventType !== 'change' || filename == null) { return }
    const fileFullPath = join(dir, filename)
    const changeInfo = batch[fileFullPath] ?? []
    changeInfo.push({ changeTime: new Date() })
    batch[fileFullPath] = changeInfo
    if (currentResolver !== nothingResolver) {
      currentResolver({ filenames: batch })
      batch = {}
      currentResolver = nothingResolver
    }
  }
  for (const dir of dirs) {
    watch(dir, { recursive: true }, handler(dir))
  }

  while (true) {
    yield new Promise(resolve => {
      if (batch.length > 0) {
        resolve({ filenames: batch })
        batch = {}
      } else {
        currentResolver = resolve
      }
    })
  }
}

async function listNonIgnoredFiles ({ ignorePath = '.gitignore', patterns, ignorePatterns = [] } = {}) {
  if (!listNonIgnoredFiles.cache) {
    const { minimatch } = await import('minimatch')
    const { join } = await import('node:path')
    const { statSync, readdirSync } = await import('node:fs')
    const allIgnorePatterns = await getIgnorePatternsFromFile(ignorePath)
    const ignoreMatchers = allIgnorePatterns.map(pattern => minimatch.filter(pattern, { matchBase: true, dot: true }))
    /** @type {(dir: string) => string[]} */
    const listFiles = (dir) => readdirSync(dir).flatMap(function (file) {
      const name = join(dir, file)
      if (file === '.git' || ignoreMatchers.some(match => match(name))) { return [] }
      const isDirectory = statSync(name).isDirectory()
      return isDirectory ? listFiles(name) : [name]
    })
    listNonIgnoredFiles.cache = listFiles('.')
    setTimeout(() => listNonIgnoredFiles.cache = undefined, 1000).unref()

  }
  return await filterFilePathsByPatterns(listNonIgnoredFiles.cache, patterns, ignorePatterns)
}

async function getIgnorePatternsFromFile (filePath) {
  return await readFile(filePath)
    .then(content => content.split('\n'))
    .then(lines => lines.filter(line => !line.startsWith('#') && line.trim() !== ''))
    .then(lines => lines.map(gitignoreToGlob))
    .then(lines => [...new Set(lines)])
}

function gitignoreToGlob (pattern) {
  if (!pattern) { return pattern }

  const negated = pattern.startsWith('!')
  const patternToTest = negated ? pattern.slice(1) : pattern
  const leadingSlash = patternToTest.startsWith('/')
  let result = leadingSlash ? patternToTest.slice(1) : patternToTest


  if (result.endsWith('*') || result.endsWith('?')) {
    // no further changes if the pattern ends with a wildcard
  } else if (!/\.[a-z\d_-]+$/.test(result)) {
    // differentiate between filenames and directory names
    if (!result.endsWith('/')) {
      result += '/'
    }

    result += '**'
  }

  if (!leadingSlash) {
    result = '**/' + result
  }


  return negated ? '!' + result : result
}

async function listChangedFilesMatching (patterns, ignorePatterns) {
  return filterFilePathsByPatterns(await listChangedFiles(), patterns, ignorePatterns)
}

async function listFileByLinterParams ({ patterns, onlyChanged, changedFiles, ignorePatterns }) {
  if (onlyChanged && changedFiles) { return await filterFilePathsByPatterns(changedFiles, patterns, ignorePatterns) }
  if (onlyChanged) { return await listChangedFilesMatching(patterns, ignorePatterns) }
  return await listNonIgnoredFiles({ patterns, ignorePatterns })
}

async function filterFilePathsByPatterns (filePaths, patterns = [], ignorePatterns = []) {
  const paths = Array.isArray(filePaths) ? filePaths : Array.from(filePaths)
  const hasPatterns = patterns.length > 0
  const hasIgnorePatterns = ignorePatterns.length > 0
  if (!hasPatterns && !hasIgnorePatterns) { return paths }
  const { minimatch } = await import('minimatch')
  const matchers = patterns.map(pattern => minimatch.filter(pattern, { matchBase: true, dot: true }))
  const matchedPaths = hasPatterns ? paths.filter(path => matchers.some(match => match(path))) : paths
  if (!hasIgnorePatterns) { return matchedPaths }
  const ignoreMatchers = ignorePatterns.map(pattern => minimatch.filter(pattern, { matchBase: true, dot: true }))
  const filteredPaths = matchedPaths.filter(path => ignoreMatchers.every(match => !match(path)))
  return filteredPaths
}

async function listChangedFiles () {
  const currentBranchName = (await git('rev-parse', '--abbrev-ref', 'HEAD'))[0]
  const mergeBase = await git('merge-base', 'HEAD', currentBranchName)
  const diffExec = git('diff', '--name-only', '--diff-filter=ACMRTUB', mergeBase)
  const lsFilesExec = git('ls-files', '--others', '--exclude-standard')
  return new Set([...(await diffExec), ...(await lsFilesExec)].filter(filename => filename.trim().length > 0))
}

// @section 10 npm utilities

function isRunningFromNPMScript () {
  return getPackageJson().name === process.env.npm_package_name
}

async function checkNodeModulesFolder () {
  if (existsSync(pathFromProject('node_modules'))) { return }
  console.log('node_modules absent, running "npm ci"...')
  await cmdSpawn('npm ci')
}

async function getLatestPublishedVersion () {
  try {
    const version = await exec(`npm view ${getPackageJson().name} version`)
    return version.stdout.trim()
  } catch {
    const latestReleasedVersion = await getLatestReleasedVersion()
    return latestReleasedVersion == null ? 'unreleased' : 'error'
  }
}

function getPackageJson () {
  const { cache } = getPackageJson
  if (cache) { return cache }
  getPackageJson.cache = JSON.parse(readFileSync(pathFromProject('package.json')))
  setTimeout(() => { getPackageJson.cache = undefined }, 1000).unref()
  return getPackageJson.cache
}

// @section 11 versioning utilities

async function getLatestReleasedVersion () {
  const changelogContent = await readFile(pathFromProject('CHANGELOG'))
  const versions = changelogContent.split('\n')
    .map(line => {
      const match = line.match(/^## \[([0-9]+\.[[0-9]+\.[[0-9]+)]\s+-\s+([^\s]+)/)
      if (!match) {
        return null
      }
      return { version: match[1], releaseDate: match[2] }
    }).filter(version => !!version)
  return versions.find(({ releaseDate }) => releaseDate.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/))
}

function getPlayWrightVersion () {
  return getPackageJson().devDependencies['@playwright/test'].replaceAll('^', '')
}

// @section 12 badge utilities

function getBadgeColors () {
  getBadgeColors.cache ??= {
    green: '#060',
    yellow: '#777700',
    orange: '#aa0000',
    red: '#aa0000',
    blue: '#05a',
  }
  return getBadgeColors.cache
}

function svgToDataURI (svg) {
  const svgURI = svg
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E')
    .replaceAll('{', '%7B')
    .replaceAll('}', '%7D')
    .replaceAll('#', '%23')
  return `data:image/svg+xml,${svgURI}`
}

function asciiIconSvg (asciicode) {
  return svgToDataURI(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><style>text {font-size: 10px; fill: #333;} @media (prefers-color-scheme: dark) {text { fill: #ccc; }} </style><text x='0' y='10'>${asciicode}</text></svg>`)
}

async function makeBadge (params) {
  const { makeBadge: libMakeBadge } = await import('badge-maker')
  const { logo, ...otherParams } = params
  return libMakeBadge({
    style: 'for-the-badge',
    logoBase64: logo,
    ...otherParams,
  })
}

function getLightVersionOfBadgeColor (color) {
  const colors = getBadgeColors()
  getLightVersionOfBadgeColor.cache ??= {
    [colors.green]: '#90e59a',
    [colors.yellow]: '#dd4',
    [colors.orange]: '#fa7',
    [colors.red]: '#f77',
    [colors.blue]: '#acf',
  }
  return getLightVersionOfBadgeColor.cache[color]
}

function badgeColor (pct) {
  const colors = getBadgeColors()
  if (pct > 80) { return colors.green }
  if (pct > 60) { return colors.yellow }
  if (pct > 40) { return colors.orange }
  if (pct > 20) { return colors.red }
  return 'red'
}

async function badgeA11ySvgStyle () {
  const { document } = await loadDom()
  const style = document.createElement('style')
  style.innerHTML = `
  text { fill: #333; }
  .icon {fill: #444; }
  rect.label { fill: #ccc; }
  rect.body { fill: var(--light-fill); }
  @media (prefers-color-scheme: dark) {
    text { fill: #fff; }
    .icon {fill: #ccc; }
    rect.label { fill: #4a4a4a; stroke: none; }
    rect.body { fill: var(--dark-fill); }
  }
  `.replaceAll(/\n+\s*/g, '')
  return style
}

async function applyA11yTheme (svgContent, options = {}) {
  const { document } = await loadDom()
  const { body } = document
  body.innerHTML = svgContent
  const svg = body.querySelector('svg')
  if (!svg) { return svgContent }
  svg.querySelectorAll('text').forEach(el => el.removeAttribute('fill'))
  if (options.replaceIconToText) {
    const img = svg.querySelector('image')
    if (img) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.innerHTML = options.replaceIconToText
      text.setAttribute('transform', 'scale(.15)')
      text.classList.add('icon')
      text.setAttribute('x', '90')
      text.setAttribute('y', '125')
      img.replaceWith(text)
    }
  }
  const rects = Array.from(svg.querySelectorAll('rect'))
  rects.slice(0, 1).forEach(el => {
    el.classList.add('label')
    el.removeAttribute('fill')
  })
  const colors = getBadgeColors()
  let color = colors.red
  rects.slice(1).forEach(el => {
    color = el.getAttribute('fill') || colors.red
    el.removeAttribute('fill')
    el.classList.add('body')
    el.style.setProperty('--dark-fill', color)
    el.style.setProperty('--light-fill', getLightVersionOfBadgeColor(color))
  })
  svg.prepend(await badgeA11ySvgStyle())

  return svg.outerHTML
}

async function makeBadgeForCoverages (path) {
  const json = await readFile(`${path}/coverage-summary.json`).then(str => JSON.parse(str))
  const svg = await makeBadge({
    label: 'coverage',
    message: `${json.total.lines.pct}%`,
    color: badgeColor(json.total.lines.pct),
    logo: asciiIconSvg('🛡︎'),
  })

  const badgeWrite = writeFile(`${path}/coverage-badge.svg`, svg)
  const a11yBadgeWrite = writeFile(`${path}/coverage-badge-a11y.svg`, await applyA11yTheme(svg, { replaceIconToText: '🛡︎' }))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function makeBadgeForTestResult (path) {
  const json = await readFile(`${path}/test-results.json`).then(str => JSON.parse(str))
  const tests = (json?.suites ?? []).flatMap(suite => suite.specs)
  const passedTests = tests.filter(test => test.ok)
  const testAmount = tests.length
  const passedAmount = passedTests.length
  const passed = passedAmount === testAmount
  const { green, red } = getBadgeColors()
  const svg = await makeBadge({
    label: 'tests',
    message: `${passedAmount} / ${testAmount}`,
    color: passed ? green : red,
    logo: asciiIconSvg('✔'),
  })

  const badgePath = `${path}/test-results-badge.svg`
  const badgeWrite = writeFile(badgePath, svg)
  const a11yBadgePath = `${path}/test-results-badge-a11y.svg`
  const a11yBadgeWrite = writeFile(a11yBadgePath, await applyA11yTheme(svg, { replaceIconToText: '✔' }))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function makeBadgeForLicense (path) {
  const svg = await makeBadge({
    label: ' license',
    message: getPackageJson().license,
    color: getBadgeColors().green,
    logo: asciiIconSvg('🏛'),
  })

  const badgeWrite = writeFile(`${path}/license-badge.svg`, svg)
  const a11yBadgeWrite = writeFile(`${path}/license-badge-a11y.svg`, await applyA11yTheme(svg, { replaceIconToText: '🏛' }))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function makeBadgeForNPMVersion (path) {
  const version = await getLatestPublishedVersion()

  const npmIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><style>g {fill: #333;stroke:#333;} @media (prefers-color-scheme: dark) {g { fill: #ccc;stroke:#ccc; }} </style><g><rect x="2" y="2" width="17" height="17" fill="transparent" stroke-width="4"/><rect x="10" y="7" width="4" height="11" stroke-width="0"/></g></svg>'

  const svg = await makeBadge({
    label: 'npm',
    message: version,
    color: getBadgeColors().blue,
    logo: svgToDataURI(npmIconSvg),
  })

  const badgeWrite = writeFile(`${path}/npm-version-badge.svg`, svg)
  const a11yBadgeWrite = writeFile(`${path}/npm-version-badge-a11y.svg`, await applyA11yTheme(svg))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function makeBadgeForRepo (path) {
  const svg = await makeBadge({
    label: 'Code Repository',
    message: 'Github',
    color: getBadgeColors().blue,
    logo: asciiIconSvg('❮❯'),
  })
  const badgeWrite = writeFile(`${path}/repo-badge.svg`, svg)
  const a11yBadgeWrite = writeFile(`${path}/repo-badge-a11y.svg`, await applyA11yTheme(svg, { replaceIconToText: '❮❯' }))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function makeBadgeForRelease (path) {
  const releaseVersion = await getLatestReleasedVersion()
  const svg = await makeBadge({
    label: 'Release',
    message: releaseVersion ? releaseVersion.version : 'Unreleased',
    color: getBadgeColors().blue,
    logo: asciiIconSvg('⛴'),
  })
  const badgeWrite = writeFile(`${path}/repo-release.svg`, svg)
  const a11yBadgeWrite = writeFile(`${path}/repo-release-a11y.svg`, await applyA11yTheme(svg, { replaceIconToText: '⛴' }))
  await Promise.all([badgeWrite, a11yBadgeWrite])
}

async function loadDom () {
  if (!loadDom.cache) {
    loadDom.cache = import('jsdom').then(({ JSDOM }) => {
      const jsdom = new JSDOM('<body></body>', { url: import.meta.url })
      const window = jsdom.window
      const DOMParser = window.DOMParser
      /** @type {Document} */
      const document = window.document
      return { window, DOMParser, document }
    })
  }
  return loadDom.cache
}

// @section 13 module graph utilities

async function createModuleGraphSvg (moduleGrapnJson) {
  const { default: { graphlib, layout } } = await import('@dagrejs/dagre')
  const { default: anafanafo } = await import('anafanafo')
  const padding = 5
  const svgStokeMargin = 5
  const inputs = moduleGrapnJson.inputs

  const graph = new graphlib.Graph()

  // Set an object for the graph label
  graph.setGraph({ rankdir: 'LR', edgesep: 30, ranksep: 60 })

  // Default to assigning a new object as a label for each new edge.
  graph.setDefaultEdgeLabel(function () { return {} })

  const inputsNodeMetrics = Object.fromEntries(
    Object.entries(inputs).map(([file]) => {
      const textWidthPx = anafanafo(file, { font: 'bold 11px Helvetica' })
      const textHeighthPx = 11
      const height = textHeighthPx + padding * 2
      const width = textWidthPx + padding * 2
      graph.setNode(file, { label: file, width: width + svgStokeMargin, height: height + svgStokeMargin })
      return [file, {
        textWidthPx, textHeighthPx, height, width,
      }]
    }),
  )

  Object.entries(inputs).forEach(([file, info]) => {
    const { imports } = info
    imports.forEach(({ path }) => graph.setEdge(file, path))
  })

  layout(graph)

  let maxWidth = 0
  let maxHeight = 0

  const inputsSvg = Object.entries(inputs).map(([file]) => {
    const { height, width } = inputsNodeMetrics[file]
    const { x, y } = graph.node(file)
    maxWidth = Math.max(maxWidth, x + width)
    maxHeight = Math.max(maxHeight, y + height)
    return {
      text: `<text x="${x}" y="${y}">${file}</text>`,
      rect: `<rect rx="4" ry="4" width="${width}" x="${x - width / 2}" y="${y - height / 2}" height="${height}"/>`,
    }
  })

  const lineArrowMarker = '<marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="10" orient="auto">' +
    '<path d="M 0 0 L 10 5 L 0 10 L 2 5 z" /></marker>'
  const marker = graph.edgeCount() > 0 ? lineArrowMarker : ''
  const defs = marker ? `<defs>${marker}</defs>` : ''

  const inputsLinesSvg = graph.edges().map(e => {
    const allPoints = [graph.node(e.v), ...graph.edge(e).points]
    const points = allPoints.map(({ x, y }) => `${x},${y}`).join(' ')
    return `<polyline class="outer" stroke-width="3" points="${points}"/><polyline points="${points}" marker-end="url(#arrowhead)"/><polyline points="${points}"/>`
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="NPM: 0.4.0" viewBox="0 0 ${maxWidth} ${maxHeight}">
  <style>
    text { fill: #222; }
    rect { fill: #ddd; stroke: #222 }
    polyline {stroke: #ddd; stroke-linejoin: round}
    polyline.outer {stroke: #222;}
    #arrowhead path {stroke: #222; fill: #ddd; stroke-linejoin: round}
    @media (prefers-color-scheme: dark) {
      text { fill: #eee; }
      rect { fill: #444; stroke:#eee }
      polyline {stroke: #222; }
      polyline.outer {stroke: #eee;}
      #arrowhead path {stroke: #eee; fill: #222; }
    }</style>
  <title>Module graph</title>${defs}
  <g shape-rendering="geometricPrecision" fill="none" >${inputsLinesSvg}</g>
  <g fill="#555" stroke="#fff" shape-rendering="geometricPrecision">${inputsSvg.map(({ rect: _ }) => _).join('')}</g>
  <g font-family="Helvetica,sans-serif" text-rendering="geometricPrecision" font-size="11" dominant-baseline="middle" text-anchor="middle">
  ${inputsSvg.map(({ text: _ }) => _).join('')}
  </g>
  </svg>`
}

// @section 14 docker utilities

async function isDockerRunning () {
  isDockerRunning.cachedResult ??= await cmdSpawn('docker info', { stdio: 'ignore' }) === 0
  return isDockerRunning.cachedResult
}

async function isInsideDockerContainer () {
  isInsideDockerContainer.cachedResult ??= existsSync('/.dockerenv') ||
    (await readFile('/proc/self/cgroup').then(text => text.includes('docker')).catch(() => false)) ||
    (await readFile('/proc/self/mountinfo').then(text => text.includes('/docker/containers/')).catch(() => false))
  return isInsideDockerContainer.cachedResult
}

async function runInDocker ({ command, imageName, volumes, workdir, env, user, rmOnFinish }) {
  const volumeParams = volumes ? Object.entries(volumes).map(([host, guest]) => `-v '${host}:${guest}' `) : ''
  const envParams = env ? Object.entries(env).map(([key, val]) => `-e '${key}=${val}' `) : ''
  const workdirParam = workdir ? `-w '${workdir}' ` : ''
  const userParam = user ? `-u '${user}' ` : ''
  const rmParam = rmOnFinish ? '--rm ' : ''
  return await cmdSpawn(`docker run -t ${rmParam}${userParam}${volumeParams}${envParams}${workdirParam} ${imageName} ${command}`)
}

// @section 15 git utilities

async function git (/** @type {string[]} */...args) {
  return (await execCmd('git', args.flat())).stdout.trim().toString().split('\n')
}

async function checkGitHooks () {
  const expectedHooksPath = 'buildfiles/git-hooks/'
  const stdoutLines = await git('config', 'get', 'core.hooksPath').catch(() => [])
  const hooksPath = stdoutLines[0]
  if (hooksPath !== expectedHooksPath) {
    if (hooksPath == null || hooksPath.trim() === '') {
      console.log('git hooks not set, setting git hooks path to ', expectedHooksPath)
    } else {
      console.log('updating git hooks path to ', expectedHooksPath)
    }

    await git('config', 'set', 'core.hooksPath', expectedHooksPath)
  }
}

async function listStashedFiles () {
  const diffExec = git('diff', '--name-only', '--staged')
  return new Set([...(await diffExec)].filter(filename => filename.trim().length > 0))
}

async function executeOnStagedOnly (callback, { stageChanges = true } = {}) {
  const stagedFiles = await listStashedFiles()
  if (stagedFiles.size > 0) {
    logStage('Stash unstaged + untracked files')
    await git('stash', 'push', '--keep-index', '-u', '-m', 'Stash unstaged + untracked files')
    let returnCode = 0
    try {
      logStage('executing tasks on staged only')
      returnCode = await callback()
    } catch {
      returnCode = 1
    } finally {
      if (returnCode === 0 && stageChanges) {
        logStage('Staging new changes')
        await git('add', '-u')
      } else {
        logStage('cleaning up changes')
        await git('restore', '.')
      }
      logStage('Pop stash')
      await git('stash', 'pop', '--index')
    }
  }
  return 0
}

// @section 16 build tools plugins

/**
 * @returns {Promise<import('esbuild').Plugin>} - esbuild plugin
 */
async function getESbuildPlugin () {
  return {
    name: 'assetsBuid',
    async setup (build) {
      build.onLoad({ filter: /\.(element|inline).css$/ }, async (args) => {
        return {
          contents: await minifyCss(await readFile(args.path)),
          loader: 'text',
        }
      })

      build.onLoad({ filter: /\.(element|inline).html$/ }, async (args) => {
        return {
          contents: await minifyHtml(await readFile(args.path)),
          loader: 'text',
        }
      })
    },

  }
}
