const encoder = new TextEncoder()
const decoder = new TextDecoder()


export const textToBytes = (str: string) => {
  encoder.encode(str)
}

export const bytesToText = (bytes: Uint8Array) => {
  decoder.decode(bytes)
}

function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m: any) => m.codePointAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
  return btoa(binString);
}

export const textToBase64 = (str: string) => {
  bytesToBase64(encoder.encode(str));
}

export const base64ToText = (base64: string) => {
  decoder.decode(base64ToBytes(base64))
}
