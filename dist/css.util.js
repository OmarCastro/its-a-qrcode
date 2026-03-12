var o=["--qrcode-color","--qrcode-dark-color","--qrcode-light-color","--qrcode-corner-color","--qrcode-corner-border-color","--qrcode-corner-center-color","--qrcode-margin","--qrcode-resize","--qrcode-style","--qrcode-dot-style","--qrcode-corner-border-style","--qrcode-corner-center-style"];function c(){for(let e of o)try{CSS.registerProperty({name:e,inherits:!0})}catch(r){if(!(r instanceof DOMException))throw r}}async function n(e){let r=`${e} {
  transition-property: ${o.join(",")};
  transition-duration: 1ms;
  transition-timing-function: step-start;
  transition-behavior: allow-discrete;

}`;return await new CSSStyleSheet().replace(r)}export{n as createStyleSheetForCSSVarObserver,c as registerCSSProperties};
//# sourceMappingURL=css.util.js.map
