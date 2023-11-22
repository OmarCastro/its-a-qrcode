/**
 * @template T
 * @param {DeepFrozen<T>} x - object structure to freeze
 * @returns {DeepFrozen<T>} - frozen object structure
 */
export function deepFreeze (x) {
  return deepFreezeWalk(x, new Set())
}

/**
 * Recursively deep freeze an object with circular or shallow-frozen references
 * @param {*} x - object structure to freeze
 * @param {Set<*>} frozen - already navigated objects
 */
function deepFreezeWalk (x, frozen) {
  if (frozen.has(x)) return x
  frozen.add(Object.freeze(x))
  Object.values(x).forEach(x => typeof x === 'object' && deepFreezeWalk(x, frozen))
  return x
}

/**
 * @template T
 * @typedef {T extends Function | boolean | number | string | null | undefined ? T :
 *  T extends Array<infer U> ? ReadonlyArray<DeepFrozen<U>> :
 *  T extends Map<infer K, infer V> ? ReadonlyMap<DeepFrozen<K>, DeepFrozen<V>> :
 *  T extends Set<infer S> ? ReadonlySet<DeepFrozen<S>> :
 * {readonly [P in keyof T]: DeepFrozen<T[P]>}
 * } DeepFrozen<T>
 *
 *  This types tells that the object and all their properties, recursively, are immutable.
 */
