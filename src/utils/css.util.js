const cssVarsToRegister = /** @type {const} */([
  '--qrcode-color',
  '--qrcode-dark-color',
  '--qrcode-light-color',
  '--qrcode-corner-color',
  '--qrcode-corner-border-color',
  '--qrcode-corner-center-color',
  '--qrcode-margin',
  '--qrcode-resize',
  '--qrcode-style',
  '--qrcode-dot-style',
  '--qrcode-corner-border-style',
  '--qrcode-corner-center-style',
])

/**
 * Registers CSS properties to fix Chrome "allow-discrete" transition on Chrome
 * @see https://issues.chromium.org/issues/360159391
 */
export function registerCSSProperties () {
  for (const name of cssVarsToRegister) {
    try {
      CSS.registerProperty({ name, inherits: true })
    } catch (e) {
      if (e instanceof DOMException) {
        // property registered, ignore it
      } else {
        throw e // re-throw the error
      }
    }
  }
}

export const varObserverCSSRules = `
  transition-property: ${cssVarsToRegister.join(',')};
  transition-duration: 1ms;
  transition-timing-function: step-start;
  transition-behavior: allow-discrete;
`
