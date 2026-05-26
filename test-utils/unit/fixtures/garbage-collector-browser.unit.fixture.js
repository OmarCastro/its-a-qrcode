function forceGC() {
  const finReg = new FinalizationRegistry(val => {
    if (val.resolved) { return }
    const end = performance.now()
    console.log(`GC triggered after ${end - val.start} milliseconds, (${val.tryNumber} tries)`)
    val.resolved = true
    val.resolve()
  })
  return new Promise(resolve => {
    const heldData = {
      resolved: false,
      tryNumber: 0,
      start: performance.now(),
      resolve
    }

    function tryAgain() {
      const size = 32 * (1024 ** 2)
      finReg.register(new Uint8Array(size), heldData)
      heldData.tryNumber++
      if (heldData.resolved) { return }
      if(heldData.tryNumber % 10 === 0){
        const end = performance.now()
        console.log(`GC not yet triggered after ${end - heldData.start} milliseconds, (${heldData.tryNumber} tries)`)
      }
      setTimeout(tryAgain, 250)
    }
    tryAgain()
  })
}

async function initFixture(){
  const noopGC = async () => {}
  const locationParams = new URL(document.location.toString()).searchParams;
  let reason = 'Garbage collection not enabled. Add "force-gc=true" query string to enable it by forcing GC (warning: slow and costly)'
  let gcMethod = noopGC

  if (typeof globalThis.gc === 'function'){
      const globalGC = globalThis.gc
      gcMethod = async () => await globalGC({ execution: 'async', type: 'major' })
      reason = ''
  } else if(locationParams.get("force-gc") === "true"){
      gcMethod = async () => await forceGC()
      reason = ''
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

