/**
 * @typedef {NodeJS.GCFunction & {status: {enabled: boolean, reason: string}}} GCFunction
 */

const noopGC = async () => {}
noopGC.status = {
  enabled: false,
  reason: 'Garbage collection not enabled',
}
/** @type {GCFunction} */
let gcMethod = noopGC

const isNode = globalThis.process?.versions?.node != null
if (isNode) {
  /** @type {NodeJS.GCFunction} */
  gcMethod = async (...args) => {
    const { setFlagsFromString } = await import('node:v8')
    const { runInNewContext } = await import('node:vm')

    setFlagsFromString('--expose_gc')
    const nodeGc = runInNewContext('gc')
    gcMethod = async (...args) => await nodeGc(...args)
    const gcEnabled = typeof nodeGc === 'function'
    gcMethod.status = {
      enabled: gcEnabled,
      reason: gcMethod.enabled ? 'Garbage collection not exposed on nodeJs' : '',
    }
    return await nodeGc(...args)
  }
}

/** @type {GCFunction} */
export const gc = async (...args) => await gcMethod(...args)
Object.defineProperty(gc, 'hasGC', {
  get: function () { return gcMethod.hasGC },
})
