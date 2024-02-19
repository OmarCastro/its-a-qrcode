/**
 * @param {Record<string, any>} exampleObject - example object data
 * @param {Element} codeView - element container
 * @returns {Promise<EditorView>} codemirror EditorView object
 */
async function transformCodeViewToEditor (exampleObject, codeView) {
  const lang = codeView.getAttribute('data-lang')
  const { createEditorView } = await import('./code-editor.lazy.js')
  const editorView = createEditorView({
    doc: codeView.textContent || '',
    onChange: (e) => {
      try {
        const value = e.state.doc.toString()
        const newTranslations = JSON.parse(value)
        if (JSON.stringify(newTranslations) !== JSON.stringify(exampleObject[lang])) {
          exampleObject[lang] = newTranslations
        }
      } catch {
        // ignore
      }
    },
    parent: codeView,
  })

  codeView.replaceChildren(editorView.dom)
  return editorView
}

/**
 * @param {Record<string, any>} exampleObject - example object data
 * @param {Element} editorElement - editor element
 */
async function applyExample (exampleObject, editorElement) {
  const exampleContainer = editorElement.closest('.example')
  if (!exampleContainer) { return }

  const lang = editorElement.getAttribute('data-lang')
  if (!lang) { return }

  editorElement.addEventListener('click', async function eventListener (event) {
    const selection = getSelection()
    if (selection && selection.toString()) {
      return
    }
    editorElement.removeEventListener('click', eventListener)
    const editorView = await transformCodeViewToEditor(exampleObject, editorElement)
    const { clientX, clientY } = event
    requestAnimationFrame(() => {
      editorView.focus()
      const anchor = editorView.posAtCoords({ x: clientX, y: clientY })
      anchor != null && editorView.dispatch({ selection: { anchor } })
    })
  })
}

/** @param {EventTarget} target - target element */
const matchesTextEdit = (target) => target.matches('.text-edit')

document.querySelectorAll('.example').forEach(element => {
  const exampleObj = {}

  console.log('.example %o', element)

  element.querySelectorAll('.example__json .editor').forEach(element => {
    const lang = element.getAttribute('data-lang')
    if (!lang) { return }
    exampleObj[lang] = JSON.parse(element.textContent || '')
    requestIdleCallback(() => applyExample(exampleObj, element))
  })

  element.addEventListener('input', handleInput.bind(null, element))

  element.addEventListener('focusin', (event) => {
    const { target } = event
    if (matchesTextEdit(target)) {
      target.innerHTML = target.textContent
    }
  })

  element.addEventListener('focusout', (event) => {
    const { target } = event
    if (matchesTextEdit(target)) {
      target.textContent = target.innerHTML
    }
  })

  element.querySelectorAll('.qrcode--content-view').forEach(contentViewElement => {
    const node = contentViewElement.querySelector('qr-code')
    if (node) {
      contentViewElement.insertAdjacentHTML('beforeend', '<pre class="qrcode--content-code-view"><label><input type="checkbox" checked/>Visible whitespace</label><span class="code"></span></pre>')
      const nodeQrContent = contentViewElement.querySelector('.code')

      nodeQrContent.addEventListener('copy', function copyWithoutRichContent (e) {
        const textOnly = document.getSelection().toString()
        const clipdata = e.clipboardData || window.clipboardData
        clipdata.setData('text/plain', textOnly)
        clipdata.setData('text/html', textOnly)
        e.preventDefault()
      })

      node.addEventListener('qrcode-content-change', () => setTextContentWithVisibleWhitespace(nodeQrContent, node.qrCodeContent))
      requestAnimationFrame(function reflectContent () {
        if (node.qrCodeContent) {
          setTextContentWithVisibleWhitespace(nodeQrContent, node.qrCodeContent)
        } else {
          requestAnimationFrame(reflectContent)
        }
      })
    }
  })
})

const BIND_SELECTOR_ATTRIBUTE = 'data-bind-selector'

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 */
function handleInput (exampleElement, event) {
  const { target } = event
  if (matchesTextEdit(target)) {
    const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || 'qr-code'
    const node = exampleElement.querySelector(selector)
    if (node) { node.textContent = event.target.textContent }
  } else if (event.target.matches('.data-error-correction-level-edit')) {
    reflectAttributeOnElement(exampleElement, event, 'data-error-correction-level')
  } else if (event.target.matches('.data-qrcode-dot-style-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-dot-style')
  } else if (event.target.matches('.data-qrcode-corner-border-style-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-corner-border-style')
  } else if (event.target.matches('.data-qrcode-corner-center-style-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-corner-center-style')
  } else if (event.target.matches('.data-qrcode-dark-color-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-dark-color')
  } else if (event.target.matches('.data-qrcode-light-color-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-light-color')
  } else if (event.target.matches('.data-qrcode-corner-color-edit')) {
    reflectStyleOnElement(exampleElement, event, '--qrcode-corner-color')
  } else if (target.matches('.example-attribute-edit')) {
    const attribute = target.getAttribute('data-attribute').trim()
    reflectAttributeOnElement(exampleElement, event, attribute)
  } else if (target.matches('.example-style-edit')) {
    const cssProperty = target.getAttribute('data-style').trim()
    reflectStyleOnElement(exampleElement, event, cssProperty)
  }
}

/**
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} attribute - reflecting attribute
 */
function reflectAttributeOnElement (exampleElement, event, attribute) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || 'qr-code'
  const node = exampleElement.querySelector(selector)
  node && node.setAttribute(attribute, event.target.textContent)
}

/**
 *
 * @param {Element} exampleElement - example element listening for input events
 * @param {InputEvent} event - triggered event
 * @param {string} styleProperty - reflecting css property
 */
function reflectStyleOnElement (exampleElement, event, styleProperty) {
  const selector = event.target.getAttribute(BIND_SELECTOR_ATTRIBUTE) || 'qr-code'
  const node = exampleElement.querySelector(selector)
  node && node.style.setProperty(styleProperty, event.target.textContent)
}

/**
 * @param {HTMLElement} element - target element
 * @param {string} textContent - text content to apply
 */
function setTextContentWithVisibleWhitespace (element, textContent) {
  element.textContent = textContent.replaceAll('\r', '␍').replaceAll(' ', '␠').replaceAll('\n', '␊\n').replaceAll('\t', '␉')
  element.innerHTML = element.innerHTML
    .replaceAll('␍', '<i class="whitespace-char whitespace-char--carriage-return"></i>')
    .replaceAll('␊', '<i class="whitespace-char whitespace-char--line-feed"></i>')
    .replaceAll('␠', '<i class="whitespace-char whitespace-char--space"> </i>')
    .replaceAll('␉', '<i class="whitespace-char--tab">\t</i>')
}

/**
 * @param {Event} event - 'input' event object
 */
function reactElementNameChange (event) {
  const componentName = event.target.closest('.component-name-edit')
  if (componentName == null) { return }
  const newText = componentName.textContent
  document.body.querySelectorAll('.component-name-edit').forEach(ref => { if (componentName !== ref) ref.textContent = newText })
  document.body.querySelectorAll('.component-name-ref').forEach(ref => { ref.textContent = newText })
}

document.body.addEventListener('input', (event) => { reactElementNameChange(event) })
