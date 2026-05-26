

async function initFixture(){
  const noopGC = async () => {}
  const isNode = globalThis.process?.versions?.node != null
  let gcMethod = noopGC
  let reason = 'Garbage collection not enabled'

  if (typeof globalThis.gc === 'function'){
      const globalGC = globalThis.gc
      gcMethod = async () => await globalGC({ execution: 'async', type: 'major' })
      reason = ''
  } else if(isNode){
    const { setFlagsFromString } = await import('node:v8')
    const { runInNewContext } = await import('node:vm')

    setFlagsFromString('--expose_gc')
    const nodeGc = runInNewContext('gc')
    if(typeof nodeGc === 'function'){
      gcMethod = async () => await nodeGc({ execution: 'async', type: 'major' })
      reason = ''
    } else {
      reason = 'Garbage collection not exposed on nodeJs'
    }
  }

  const api = {
    run: gcMethod,
    enabled: typeof gcMethod === 'function' && gcMethod !== noopGC,
    reason,
  }

  return {
    setup: () => api
  }
}

export const { setup } = await initFixture()
/**
 * @typedef {object} GarbageCollectionApi
 * @property {() => Promise<void>} run - triggers Garbage Collection (GC) if enabled, does nothing otherwise
 * @property {boolean} enabled - flag showing wether GC is enabled or not
 * @property {string} reason - reason why GC is disabled; empty string value if enabled
 */
