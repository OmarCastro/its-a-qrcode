# It's a QR Code

[![npm version](https://omarcastro.github.io/its-a-qrcode/reports/npm-version-badge-a11y.svg)](https://www.npmjs.com/package/its-a-qrcode)
[![latest version](https://omarcastro.github.io/its-a-qrcode/reports/repo-release-a11y.svg)](https://github.com/OmarCastro/its-a-qrcode/releases/latest)
[![License](https://omarcastro.github.io/its-a-qrcode/reports/license-badge-a11y.svg)](https://github.com/OmarCastro/its-a-qrcode/blob/main/LICENSE)
[![Continuous Integration Test Report](https://omarcastro.github.io/its-a-qrcode/reports/test-results/test-results-badge-a11y.svg)](https://omarcastro.github.io/its-a-qrcode/reports/playwright-report)
[![Test Coverage Report](https://omarcastro.github.io/its-a-qrcode/reports/coverage/final/coverage-badge-a11y.svg)](https://omarcastro.github.io/its-a-qrcode/reports/coverage/final)


"It's a QR Code" is a web component that shows its text content as QR code image

## Getting started 

### CDN

To use a CDN all you need is to add the following code in the HTML page:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/OmarCastro/its-a-qrcode/dist/qrcode.element.min.js?named=qr-code"></script>
```

The query string `named` automatically registers the component with the value defined

### NPM

If you wish to import from npm and use a bundler, you can install the `its-a-qrcode` package

```bash
npm install its-a-qrcode
```

Not all bundlers support query strings, it is recommended to import and register the component, like the following code:

```js
import element from 'its-a-qrcode'
customElements.define('qr-code', element)
```


## Documentation

full documentation on: https://omarcastro.github.io/its-a-qrcode
