#!/usr/bin/env -S node --input-type=module
/* eslint-disable camelcase */
import process from 'node:process'
import fs from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'
import { exec, spawn } from 'node:child_process'

const execPromise = promisify(exec)

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
  lint: {
    description: 'validates the code',
    cb: async () => { await execlintCode(); process.exit(0) },
  },
  dev: {
    description: 'setup dev environment',
    cb: async () => { await execDevEnvironment(); process.exit(0) },
  },
  'dev-server': {
    description: 'launch dev server',
    cb: async () => { await openDevServer(); await wait(2 ** 30) },
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

async function execDevEnvironment () {
  await openDevServer()
  await Promise.all([execlintCode(), execTests()])
  await execBuild()

  const watcher = watchDirs(
    new URL('src', projectPathURL).pathname,
    new URL('docs', projectPathURL).pathname,
  )

  for await (const change of watcher) {
    console.log(`file "${change.filename}" changed`)
    await Promise.all([execBuild(), execTests()])
    updateDevServer()
    await execlintCode()
  }
}

async function execTests () {
  await cmdSpawn('TZ=UTC npx c8 --all --include "src/**/*.{js,ts}" --exclude "src/**/*.{test,spec}.{js,ts}" --temp-directory ".tmp/coverage" --report-dir reports/.tmp/coverage/unit --reporter json-summary --reporter text --reporter html playwright test')
  if (existsSync('reports/coverage')) {
    await mv('reports/coverage', 'reports/coverage.bak')
  }
  await mv('reports/.tmp/coverage', 'reports/coverage')
  const rmTmp = rm_rf('reports/.tmp')
  const rmBak = rm_rf('reports/coverage.bak')

  const badges = cmdSpawn('node buildfiles/scripts/build-badges.js')

  const files = Array.from(await getFiles('reports/coverage/unit'))
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
    outfile: '.tmp/build/dist/i18n.element.min.js',
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

  await execPromise(`${process.argv[0]} buildfiles/scripts/build-html.js index.html`)

  logStage('move to final dir')

  await rm_rf('build')
  await cp_R('.tmp/build', 'build')
  await cp_R('build/dist', 'build/docs/dist')

  logEndStage()
}

async function execlintCode () {
  logStartStage('lint', 'lint using eslint')
  await cmdSpawn('npx eslint . --fix')
  logStage('typecheck with typescript')
  await cmdSpawn('npx tsc --noEmit -p jsconfig.json')
  logEndStage()
}

async function execGithubBuildWorkflow () {
  await execTests()
  await execBuild()
}

function helpText () {
  const maxTaskLength = Math.max(...['help, --help, -h', ...Object.keys(tasks)].map(text => text.length))
  const tasksToShow = Object.entries(tasks).filter(([_, value]) => value !== helpTask)
  return `Usage: run <task>

Tasks: 
  ${tasksToShow.map(([key, value]) => `${key.padEnd(maxTaskLength, ' ')}  ${value.description}`).join('\n  ')}
  ${'help, --help, -h'.padEnd(maxTaskLength, ' ')}  ${helpTask.description}`
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
  return new Promise((resolve) => { p.on('exit', resolve) })
}

async function openDevServer () {
  const { default: serve } = await import('wonton')
  const { default: open } = await import('open')

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
    fallback: 'index.html',
    live: true,
    root: pathFromProject('.'),
    tls: {
      cert: certFilePath,
      key: keyFilePath,
    },
  }
  serve.start(params)
  updateDevServer = serve.update
  open(`https://${host}:${port}/build/docs`)
}

function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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
