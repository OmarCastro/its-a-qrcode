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

  element.addEventListener('input', (event) => {
    const bindSelectorAttr = 'data-bind-selector'
    const { target } = event
    if (matchesTextEdit(target)) {
      const selector = event.target.getAttribute(bindSelectorAttr) || 'qr-code'
      const node = element.querySelector(selector)
      if (node) { node.textContent = event.target.textContent }
    }
    if (event.target.matches('.data-error-correction-level-edit')) {
      const selector = event.target.getAttribute(bindSelectorAttr) || '[data-error-correction-level]'
      const node = element.querySelector(selector)
      node && node.setAttribute('data-error-correction-level', event.target.textContent)
    }

    if (event.target.matches('.data-qrcode-resize-edit')) {
      const selector = event.target.getAttribute(bindSelectorAttr) || 'qr-code'
      const node = element.querySelector(selector)
      node && node.style.setProperty('--qrcode-resize', event.target.textContent || '""')
    }
  })

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

      nodeQrContent.addEventListener('copy', function (e) {
        e.preventDefault()
        console.log(e)
        // var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..');
        // document.execCommand('insertText', false, text);
      })

      node.addEventListener('qrcode-content-change', () => setTextContentWithVisibleWhiteSpace(nodeQrContent, node.qrCodeContent))
      requestAnimationFrame(function reflectContent () {
        if (node.qrCodeContent) {
          setTextContentWithVisibleWhiteSpace(nodeQrContent, node.qrCodeContent)
        } else {
          requestAnimationFrame(reflectContent)
        }
      })
    }
  })
})

/**
 *
 * @param {HTMLElement} element
 * @param {string} textContent
 */
function setTextContentWithVisibleWhiteSpace (element, textContent) {
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
