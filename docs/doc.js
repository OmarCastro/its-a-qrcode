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
    if (event.target.matches('.lang-edit')) {
      const selector = event.target.getAttribute(bindSelectorAttr) || '[lang]'
      const node = element.querySelector(selector)
      node && node.setAttribute('lang', event.target.textContent)
    }
    if (event.target.matches('.data-i18n-edit')) {
      const selector = event.target.getAttribute(bindSelectorAttr) || '[data-i18n-text]'
      const node = element.querySelector(selector)
      node && node.setAttribute('data-i18n-text', event.target.textContent)
    }
    if (event.target.matches('.data-i18n--title-edit')) {
      const selector = event.target.getAttribute(bindSelectorAttr) || '[data-i18n--title]'
      const node = element.querySelector(selector)
      node && node.setAttribute('data-i18n--title', event.target.textContent)
    }
  })
})

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
