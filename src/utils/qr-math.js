const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);


// initialize tables
for (let i = 0; i < 8; i += 1) {
  EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i += 1) {
  EXP_TABLE[i] = EXP_TABLE[i - 4]
    ^ EXP_TABLE[i - 5]
    ^ EXP_TABLE[i - 6]
    ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i += 1) {
  LOG_TABLE[EXP_TABLE[i]] = i;
}

/** @param {number} n */
export function glog(n){
  if (n < 1) { throw Error('glog(' + n + ')') }
  return LOG_TABLE[n];
}

/** @param {number} n */
export function gexp(n){
  while (n < 0) { n += 255; }
  while (n >= 256) { n -= 255; }
  return EXP_TABLE[n];
}

