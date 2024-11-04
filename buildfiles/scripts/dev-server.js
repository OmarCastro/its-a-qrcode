/** @import {IncomingMessage, ServerResponse} from 'node:http' */
import https from 'node:https'
import http from 'node:http'
import { readFileSync, statSync, existsSync } from 'node:fs'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const CLIENT_WEBSOCKET_CODE = `
(() => {
    const source = new EventSource("/live-sse");
    source.addEventListener('message', e => {
      location.reload();
    });
})()
`.trim()

const projectPathURL = new URL('../../', import.meta.url)
const pathFromProject = (path) => new URL(path, projectPathURL).pathname
const rootPath = pathFromProject('.')

/**
 * get or generate TLS certificate to use on HTTPS server
 * @returns {{key: string, cert: string}} TLS certificate
 */
async function getTLSCertificate () {
  const certFilePath = '.tmp/dev-server/cert.crt'
  const keyFilePath = '.tmp/dev-server/cert.key'

  if (!existsSync(certFilePath) || !existsSync(keyFilePath)) {
    const { default: mkcert } = await import('mkcert')
    await mkdir('.tmp/dev-server', { recursive: true })
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

    const result = {
      key: cert.key,
      cert: `${cert.cert}\n${ca.cert}`

    }

    await writeFile(certFilePath, result.cert)
    await writeFile(keyFilePath, result.key)
    return result
  }

  return {
    key: readFileSync(keyFilePath),
    cert: readFileSync(certFilePath),

  }
}

const certificate = await getTLSCertificate()

/**
 * @typedef {object} Server
 * @property {(port: number) => void} listen - starts server at defined port
 * @property {() => void} update - trigger livereload on loading pages
 */

/**
 * @returns {Server} server ready to start listening
 */
export function Server () {
  const sessions = new Set()

  /**
   * General request handler and router
   * @param {IncomingMessage} req - incoming request
   * @param {ServerResponse} res - response api
   */
  function requestHandler (req, res) {
    const method = req.method.toLowerCase()
    if (method === 'get') {
      if (req.url === '/live-sse') {
        sseStart(sessions, res)
        return
      }

      // No need to ensure the route can't access other local files,
      // since this is for development only.
      if (serveStaticPageIfExists(req, res, true)) {
        return
      }
    }
    res.writeHead(404)
    res.end()
  }

  const httpsOptions = {
    ...certificate
  }
  const server = https.createServer(httpsOptions, requestHandler)

  return {
    listen: (port) => { server.listen(port) },
    update: () => sessions.forEach(session => session.write('data: reload\n\n'))
  }
}

/**
 * @returns {Pick<Server, ["listen"]>} server ready to start listening
 */
export function TestServer () {
  /**
   * General request handler and router
   * @param {IncomingMessage} req - incoming request
   * @param {ServerResponse} res - response api
   */
  function requestHandler (req, res) {
    const method = req.method.toLowerCase()
    // No need to ensure the route can't access other local files,
    // since this is for development only.

    if (method === 'get' && serveStaticPageIfExists(req, res, false)) {
      return
    }
    res.writeHead(404)
    res.end()
  }

  const server = http.createServer(requestHandler)

  return {
    listen: (port) => { server.listen(port) },
  }
}

/**
 * Use classic server-logic to serve a static file (e.g. default to 'index.html' etc)
 * @param {IncomingMessage} req - incoming request
 * @param {ServerResponse} res - response api
 * @param {boolean} livereload - flag to enable/disable livereload
 * @param {string} [route] - route
 * @returns {boolean} Whether or not the page exists and was served
 */
function serveStaticPageIfExists (req, res, livereload, route) {
  const { url } = req
  if (!url) { return false }
  if (!route) {
    const urlPath = new URL(url, `http://${req.headers.host}`).pathname
    route = path.normalize(path.join(rootPath, urlPath))
  }
  // We don't care about performance for a dev server, so sync functions are fine.
  // If the route exists it's either the exact file we want or the path to a directory
  // in which case we'd serve up the 'index.html' file.
  if (!existsSync(route)) { return false }
  if (statSync(route).isDirectory()) {
    if (existsSync(path.join(route, 'index.html')) && !url.endsWith('/')) {
      res.setHeader('location', url + '/')
      res.writeHead(303)
      res.end()
      return true
    }
    return serveStaticPageIfExists(req, res, livereload, path.join(route, 'index.html'))
  } else if (statSync(route).isFile()) {
    /** @type {string|Buffer} */
    let file = readFileSync(route)
    if (route.endsWith('.html') && livereload) {
      // Inject the client-side websocket code.
      // This sounds fancier than it is; simply
      // append the script to the end since
      // browsers allow for tons of deviation
      // from *technically correct* HTML.
      file = `${file.toString()}\n\n<script>${CLIENT_WEBSOCKET_CODE}</script>`
    } else if (route.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript')
    }
    res.writeHead(200)
    res.end(file)
    return true
  }
  return false
}

/**
 * Start SSE response, and save it on server sse session list
 * @param {Set<ServerResponse>} sessions - server sse session list
 * @param {ServerResponse} res - SSE response
 */
function sseStart (sessions, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  sessions.add(res)
  res.addListener('close', () => sessions.delete(res))
}
