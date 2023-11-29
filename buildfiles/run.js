#!/usr/bin/env -S node --input-type=module
/* eslint-disable camelcase, max-lines-per-function, jsdoc/require-jsdoc, jsdoc/require-param-description */
import process from 'node:process'
import fs from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { execFile as baseExecFile, spawn } from 'node:child_process'

const execFile = promisify(baseExecFile)

const projectPathURL = new URL('../', import.meta.url)
const pathFromProject = (path) => new URL(path, projectPathURL).pathname
process.chdir(pathFromProject('.'))
let updateDevServer = () => {}

const args = process.argv.slice(2)

const helpTask = {
  description: 'show this help',
  cb: async () => { console.log(helpText()); process.exit(0) },
}
const tasks = {
  build: {
    description: 'builds the project',
    cb: async () => { await execBuild(); process.exit(0) },
  },
  'build:github-action': {
    description: 'runs build for github action',
    cb: async () => { await execGithubBuildWorkflow(); process.exit(0) },
  },
  test: {
    description: 'builds the project',
    cb: async () => { await execTests(); process.exit(0) },
  },
  linc: {
    description: 'validates the code only on changed files',
    cb: async () => { process.exit(await execlintCodeOnChanged()) },
  },
  lint: {
    description: 'validates the code',
    cb: async () => { process.exit(await execlintCode()) },
  },
  dev: {
    description: 'setup dev environment',
    cb: async () => { await execDevEnvironment(); process.exit(0) },
  },
  'dev:open': {
    description: 'setup dev environment and opens dev server in browser',
    cb: async () => { await execDevEnvironment({ openBrowser: true }); process.exit(0) },
  },
  'dev-server': {
    description: 'launch dev server',
    cb: async () => { await openDevServer(); await wait(2 ** 30) },
  },
  'dev-server:open': {
    description: 'launch dev server and opens in browser',
    cb: async () => { await openDevServer({ openBrowser: true }); await wait(2 ** 30) },
  },
  help: helpTask,
  '--help': helpTask,
  '-h': helpTask,
}

async function main () {
  if (args.length <= 0) {
    console.log(helpText())
    return process.exit(0)
  }

  const taskName = args[0]

  if (!Object.hasOwn(tasks, taskName)) {
    console.error(`unknown task ${taskName}\n\n${helpText()}`)
    return process.exit(1)
  }

  await checkNodeModulesFolder()
  await tasks[taskName].cb()
  return process.exit(0)
}

await main()

async function execDevEnvironment ({ openBrowser = false } = {}) {
  await openDevServer({ openBrowser })
  await Promise.all([execlintCodeOnChanged(), execTests()])
  await execBuild()

  const watcher = watchDirs(
    new URL('src', projectPathURL).pathname,
    new URL('docs', projectPathURL).pathname,
  )

  for await (const change of watcher) {
    console.log(`file "${change.filename}" changed`)
    await Promise.all([execBuild(), execTests()])
    updateDevServer()
    await execlintCodeOnChanged()
  }
}

async function execTests () {
  const COVERAGE_DIR = 'reports/coverage'
  const REPORTS_TMP_DIR = 'reports/.tmp'
  const COVERAGE_TMP_DIR = `${REPORTS_TMP_DIR}/coverage`
  const COVERAGE_BACKUP_DIR = 'reports/coverage.bak'

  await cmdSpawn('TZ=UTC npx c8 --all --include "src/**/*.{js,ts}" --exclude "src/**/*.{test,spec}.{js,ts}" --temp-directory ".tmp/coverage" --report-dir reports/.tmp/coverage/unit --reporter json-summary --reporter text-summary --reporter html playwright test')
  if (existsSync(COVERAGE_DIR)) {
    await mv(COVERAGE_DIR, COVERAGE_BACKUP_DIR)
  }
  await mv(COVERAGE_TMP_DIR, COVERAGE_DIR)
  const rmTmp = rm_rf(REPORTS_TMP_DIR)
  const rmBak = rm_rf(COVERAGE_BACKUP_DIR)

  const badges = cmdSpawn('node buildfiles/scripts/build-badges.js')

  const files = Array.from(await getFiles(`${COVERAGE_DIR}/unit`))
  const cpBase = files.filter(path => basename(path) === 'base.css').map(path => fs.cp('buildfiles/assets/coverage-report-base.css', path))
  const cpPrettify = files.filter(path => basename(path) === 'prettify.css').map(path => fs.cp('buildfiles/assets/coverage-report-prettify.css', path))
  await Promise.all([rmTmp, rmBak, badges, ...cpBase, ...cpPrettify])

  await rm_rf('build/docs/reports')
  await mkdir_p('build/docs')
  await cp_R('reports', 'build/docs/reports')
}

async function execBuild () {
  logStartStage('build', 'clean tmp dir')

  await rm_rf('.tmp/build')
  await mkdir_p('.tmp/build/dist', '.tmp/build/docs')

  logStage('bundle')

  const esbuild = await import('esbuild')

  const commonBuildParams = {
    target: ['es2022'],
    bundle: true,
    minify: true,
    sourcemap: true,
    absWorkingDir: pathFromProject('.'),
    logLevel: 'info',
  }

  const esbuild1 = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['src/entrypoint/browser.js'],
    outfile: '.tmp/build/dist/qrcode.element.min.js',
    format: 'esm',
    loader: {
      '.element.html': 'text',
      '.element.css': 'text',
    },
  })

  const esbuild2 = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['docs/doc.js'],
    outdir: '.tmp/build/docs',
    splitting: true,
    chunkNames: 'chunk/[name].[hash]',
    format: 'esm',
    loader: {
      '.element.html': 'text',
      '.element.css': 'text',
    },
  })

  const esbuild3 = esbuild.build({
    ...commonBuildParams,
    entryPoints: ['docs/doc.css'],
    outfile: '.tmp/build/docs/doc.css',
  })

  await Promise.all([esbuild1, esbuild2, esbuild3])

  logStage('copy reports')

  await cp_R('reports', '.tmp/build/docs/reports')

  logStage('build html')

  await cmdSpawn(`${process.argv[0]} buildfiles/scripts/build-html.js index.html`)
  await cmdSpawn(`${process.argv[0]} buildfiles/scripts/build-html.js test-page.html`)

  logStage('move to final dir')

  await rm_rf('build')
  await cp_R('.tmp/build', 'build')
  await cp_R('build/dist', 'build/docs/dist')

  logEndStage()
}

async function execlintCodeOnChanged () {
  logStartStage('linc', 'lint using eslint')
  const returnCodeLint = await lintCode({ onlyChanged: true }, { fix: true })
  logStage('lint using stylelint')
  const returnStyleLint = await lintStyles({ onlyChanged: true })
  logStage('validating json')
  const returnJsonLint = await validateJson({ onlyChanged: true })
  logStage('validating yaml')
  const returnYamlLint = await validateYaml({ onlyChanged: true })
  let returnCodeTs = 0
  logStage('typecheck with typescript')
  const changedFiles = await listChangedFiles()
  if ([...changedFiles].some(changedFile => changedFile.startsWith('src/'))) {
    returnCodeTs = await cmdSpawn('npx tsc --noEmit -p jsconfig.json')
  } else {
    process.stdout.write('no files to check...')
  }
  logEndStage()
  return returnCodeLint + returnCodeTs + returnStyleLint + returnJsonLint + returnYamlLint
}

async function execlintCode () {
  logStartStage('lint', 'lint using eslint')
  const returnCodeLint = await lintCode({ onlyChanged: false }, { fix: true })
  logStage('lint using stylelint')
  const returnStyleLint = await lintStyles({ onlyChanged: false })
  logStage('validating json')
  const returnJsonLint = await validateJson({ onlyChanged: false })
  logStage('validating yaml')
  const returnYamlLint = await validateYaml({ onlyChanged: false })
  logStage('typecheck with typescript')
  const returnCodeTs = await cmdSpawn('npx tsc --noEmit -p jsconfig.json')
  logEndStage()
  return returnCodeLint + returnCodeTs + returnStyleLint + returnJsonLint + returnYamlLint
}

async function execGithubBuildWorkflow () {
  await execTests()
  await execBuild()
}

function helpText () {
  const fromNPM = isRunningFromNPMScript()

  const helpArgs = fromNPM ? 'help' : 'help, --help, -h'
  const maxTaskLength = Math.max(...[helpArgs, ...Object.keys(tasks)].map(text => text.length))
  const tasksToShow = Object.entries(tasks).filter(([_, value]) => value !== helpTask)
  const usageLine = fromNPM ? 'npm run <task>' : 'run <task>'
  return `Usage: ${usageLine}

Tasks: 
  ${tasksToShow.map(([key, value]) => `${key.padEnd(maxTaskLength, ' ')}  ${value.description}`).join('\n  ')}
  ${helpArgs.padEnd(maxTaskLength, ' ')}  ${helpTask.description}`
}

/** @param {string[]} paths  */
async function rm_rf (...paths) {
  await Promise.all(paths.map(path => fs.rm(path, { recursive: true, force: true })))
}

/** @param {string[]} paths  */
async function mkdir_p (...paths) {
  await Promise.all(paths.map(path => fs.mkdir(path, { recursive: true })))
}

/**
 * @param {string} src
   @param {string} dest  */
async function cp_R (src, dest) {
  await fs.cp(src, dest, { recursive: true })
}

async function mv (src, dest) {
  await fs.rename(src, dest)
}

function logStage (stage) {
  logEndStage(); logStartStage(logStage.currentJobName, stage)
}

function logEndStage () {
  console.log('done')
}

function logStartStage (jobname, stage) {
  logStage.currentJobName = jobname
  process.stdout.write(`[${jobname}] ${stage}...`)
}

async function checkNodeModulesFolder () {
  if (existsSync(pathFromProject('node_modules'))) { return }
  console.log('node_modules absent running "npm ci"...')
  await cmdSpawn('npm ci')
}

function cmdSpawn (command, options = {}) {
  const p = spawn('/bin/sh', ['-c', command], { stdio: 'inherit', ...options })
  return new Promise((resolve) => {
    p.on('exit', (code) => resolve(code ?? 1))
  }).then(code => +code)
}

async function openDevServer ({ openBrowser = false } = {}) {
  const { default: serve } = await import('wonton')

  const certFilePath = '.tmp/dev-server/cert.crt'
  const keyFilePath = '.tmp/dev-server/cert.key'

  if (!existsSync(certFilePath) || !existsSync(keyFilePath)) {
    const { default: mkcert } = await import('mkcert')
    await mkdir_p('.tmp/dev-server')
    const ca = await mkcert.createCA({
      organization: 'Hello CA',
      countryCode: 'NP',
      state: 'Bagmati',
      locality: 'Kathmandu',
      validity: 365,
    })

    const cert = await mkcert.createCert({
      domains: ['127.0.0.1', 'localhost'],
      validity: 365,
      ca,
    })

    await fs.writeFile(certFilePath, `${cert.cert}\n${ca.cert}`)
    await fs.writeFile(keyFilePath, cert.key)
  }

  const host = 'localhost'
  const port = 8181

  const params = {
    host,
    port,
    live: true,
    root: pathFromProject('.'),
    tls: {
      cert: certFilePath,
      key: keyFilePath,
    },
  }
  serve.start(params)
  updateDevServer = serve.update

  if (openBrowser) {
    const { default: open } = await import('open')
    open(`https://${host}:${port}/build/docs`)
  }
}

function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Linters

async function lintCode ({ onlyChanged }, options) {
  const esLintFilePatterns = ['**/*.js']

  const finalFilePatterns = onlyChanged ? await listChangedFilesMatching(...esLintFilePatterns) : esLintFilePatterns
  if (finalFilePatterns.length <= 0) {
    process.stdout.write('no files to lint. ')
    return 0
  }
  const { ESLint } = await import('eslint')
  const eslint = new ESLint(options)
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

async function lintStyles ({ onlyChanged }) {
  const styleLintFilePatterns = ['**/*.css']
  const finalFilePatterns = onlyChanged ? await listChangedFilesMatching(...styleLintFilePatterns) : styleLintFilePatterns
  if (finalFilePatterns.length <= 0) {
    process.stdout.write('no stylesheets to lint. ')
    return 0
  }
  const { default: stylelint } = await import('stylelint')
  const result = await stylelint.lint({ files: finalFilePatterns })
  const filesLinted = result.results.length
  process.stdout.write(`linted ${filesLinted} files. `)

  const output = stylelint.formatters.string(result.results)
  if (output) {
    console.log('\n' + output)
  } else {
    process.stdout.write('OK...')
  }

  return result.errored ? 1 : 0
}

async function validateJson ({ onlyChanged }) {
  return await validateFiles({
    patterns: ['*.json'],
    onlyChanged,
    validation: async (file) => JSON.parse(await fs.readFile(file, 'utf8')),
  })
}

async function validateYaml ({ onlyChanged }) {
  const { load } = await import('js-yaml')
  return await validateFiles({
    patterns: ['*.yml', '*.yaml'],
    onlyChanged,
    validation: async (file) => load(await fs.readFile(file, 'utf8')),
  })
}

async function validateFiles ({ patterns, onlyChanged, validation }) {
  const fileList = onlyChanged ? await listChangedFilesMatching(...patterns) : await listNonIgnoredFiles({ patterns })
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

// File Utils

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

async function * watchDirs (...dirs) {
  const { watch } = await import('chokidar')
  let currentResolver = () => {}
  console.log(`watching ${dirs}`)
  watch(dirs).on('change', (filename, stats) => currentResolver({ filename, stats }))
  while (true) {
    yield new Promise(resolve => { currentResolver = resolve })
  }
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

async function execGitCmd (args) {
  return (await execCmd('git', args)).stdout.trim().toString().split('\n')
}

async function listNonIgnoredFiles ({ ignorePath = '.gitignore', patterns } = {}) {
  const { minimatch } = await import('minimatch')
  const { join } = await import('node:path')
  const { statSync, readdirSync } = await import('node:fs')
  const ignorePatterns = await getIgnorePatternsFromFile(ignorePath)
  const ignoreMatchers = ignorePatterns.map(pattern => minimatch.filter(pattern, { matchBase: true }))
  const listFiles = (dir) => readdirSync(dir).reduce(function (list, file) {
    const name = join(dir, file)
    if (file === '.git' || ignoreMatchers.some(match => match(name))) { return list }
    const isDir = statSync(name).isDirectory()
    return list.concat(isDir ? listFiles(name) : [name])
  }, [])

  const fileList = listFiles('.')
  if (!patterns) { return fileList }
  const intersection = patterns.flatMap(pattern => minimatch.match(fileList, pattern, { matchBase: true, dot: true }))
  return [...new Set(intersection)]
}

async function getIgnorePatternsFromFile (filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim() !== '')
  return [...new Set(lines)]
}

async function listChangedFilesMatching (...patterns) {
  const { minimatch } = await import('minimatch')
  const changedFiles = [...(await listChangedFiles())]
  const intersection = patterns.flatMap(pattern => minimatch.match(changedFiles, pattern, { matchBase: true }))
  return [...new Set(intersection)]
}

async function listChangedFiles () {
  const mainBranchName = 'main'
  const mergeBase = await execGitCmd(['merge-base', 'HEAD', mainBranchName])
  const diffExec = execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', mergeBase])
  const lsFilesExec = execGitCmd(['ls-files', '--others', '--exclude-standard'])
  return new Set([...(await diffExec), ...(await lsFilesExec)].filter(filename => filename.trim().length > 0))
}

function isRunningFromNPMScript () {
  return JSON.parse(readFileSync(pathFromProject('./package.json'))).name === process.env.npm_package_name
}
