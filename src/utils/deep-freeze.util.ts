
export function deepFreeze <T>(x: T):DeepFrozen<T> {
  Object.freeze(x)
  x && Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze)
  return x as DeepFrozen<T>
}



type DeepFrozen<T> =
  T extends Function | boolean | number | string | null | undefined ? T :
  T extends Array<infer U> ? ReadonlyArray<DeepFrozen<U>> :
  T extends Map<infer K, infer V> ? ReadonlyMap<DeepFrozen<K>, DeepFrozen<V>> :
  T extends Set<infer S> ? ReadonlySet<DeepFrozen<S>> :
  {readonly [P in keyof T]: DeepFrozen<T[P]>}

