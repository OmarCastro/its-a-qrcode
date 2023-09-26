/**
 * @template T
 * @param {DeepFrozen<T>} x
 * @returns {DeepFrozen<T>}
 */
export function deepFreeze (x) {
  Object.freeze(x)
  x && Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze)
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
