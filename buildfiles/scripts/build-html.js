import Prism from 'prismjs'
import { globSync } from 'glob'
import { minify } from 'html-minifier'
import { imageSize } from 'image-size'
import { JSDOM } from 'jsdom'
import { marked } from 'marked'

const dom = new JSDOM('', {
  url: import.meta.url,
})
/** @type {Window} */
const window = dom.window
const document = window.document
const DOMParser = window.DOMParser

globalThis.window = dom.window
globalThis.document = document

if (document == null) {
  throw new Error('error parsing document')
}
// @ts-ignore
await import('prismjs/plugins/keep-markup/prism-keep-markup.js')
// @ts-ignore
await import('prismjs/components/prism-json.js')
await import('prismjs/components/prism-bash.js')

const projectPath = new URL('../../', import.meta.url)
const docsPath = new URL('docs', projectPath).pathname
const docsOutputPath = new URL('.tmp/build/docs', projectPath).pathname

const fs = await import('fs')

const data = fs.readFileSync(`${docsPath}/${process.argv[2]}`, 'utf8')

const parsed = new DOMParser().parseFromString(data, 'text/html')
document.replaceChild(parsed.documentElement, document.documentElement)

const exampleCode = (strings, ...expr) => {
  let statement = strings[0]

  for (let i = 0; i < expr.length; i++) {
    statement += String(expr[i]).replace(/</g, '&lt')
      .replaceAll('{{elementName}}', '<span class="component-name-ref keep-markup">i18n-container</span>')
      .replace(/{{([^¦]+)¦lang}}/g, '<span contenteditable="true" class="lang-edit">$1</span>')
      .replace(/{{([^¦]+)¦lang¦([^}]+)}}/g, '<span contenteditable="true" class="lang-edit" data-bind-selector="$2">$1</span>')
      .replace(/{{([^¦]+)¦data-i18n}}/, '<span contenteditable="true" class="data-i18n-edit">$1</span>')
      .replace(/{{([^¦]+)¦data-i18n¦([^}]+)}}/g, '<span contenteditable="true" class="data-i18n-edit" data-bind-selector="$2">$1</span>')
      .replace(/{{([^¦]+)¦data-i18n--title}}/, '<span contenteditable="true" class="data-i18n--title-edit">$1</span>')
    statement += strings[i + 1]
  }

  return statement
}

/**
 * @param {string} selector
 * @returns
 */
const queryAll = (selector) => [...document.documentElement.querySelectorAll(selector)]

queryAll('script.html-example').forEach(element => {
  const pre = document.createElement('pre')
  pre.innerHTML = exampleCode`<code class="language-markup keep-markup">${dedent(element.innerHTML)}</code>`
  element.replaceWith(pre)
})

queryAll('script.css-example').forEach(element => {
  const pre = document.createElement('pre')
  pre.innerHTML = exampleCode`<code class="language-css keep-markup">${dedent(element.innerHTML)}</code>`
  element.replaceWith(pre)
})

queryAll('script.json-example').forEach(element => {
  const pre = document.createElement('pre')
  pre.innerHTML = exampleCode`<code class="language-json keep-markup">${dedent(element.innerHTML)}</code>`
  element.replaceWith(pre)
})

queryAll('script.js-example').forEach(element => {
  const pre = document.createElement('pre')
  pre.innerHTML = exampleCode`<code class="language-js keep-markup">${dedent(element.innerHTML)}</code>`
  element.replaceWith(pre)
})

queryAll('code').forEach(element => {
  Prism.highlightElement(element, false)
})

queryAll('svg[ss:include]').forEach(element => {
  const ssInclude = element.getAttribute('ss:include')
  const svgText = fs.readFileSync(`${docsOutputPath}/${ssInclude}`, 'utf8')
  element.outerHTML = svgText
})

queryAll('[ss:markdown]').forEach(element => {
  const md = dedent(element.innerHTML)
  element.innerHTML = marked(md, { mangle: false, headerIds: false })
})

queryAll('img[ss:size]').forEach(element => {
  const imageSrc = element.getAttribute('src')
  const size = imageSize(`${docsOutputPath}/${imageSrc}`)
  element.removeAttribute('ss:size')
  element.setAttribute('width', `${size.width}`)
  element.setAttribute('height', `${size.height}`)
})

queryAll('img[ss:badge-attrs]').forEach(element => {
  const imageSrc = element.getAttribute('src')
  const svgText = fs.readFileSync(`${docsOutputPath}/${imageSrc}`, 'utf8')
  const div = document.createElement('div')
  div.innerHTML = svgText
  element.removeAttribute('ss:badge-attrs')
  const svg = div.querySelector('svg')
  if (!svg) { throw Error(`${docsOutputPath}/${imageSrc} is not a valid svg`) }

  const alt = svg.getAttribute('aria-label')
  if (alt) { element.setAttribute('alt', alt) }

  const title = svg.querySelector('title')?.textContent
  if (title) { element.setAttribute('title', title) }
})

queryAll('link[href][rel="stylesheet"][ss:inline]').forEach(element => {
  const href = element.getAttribute('href')
  const cssText = fs.readFileSync(`${docsOutputPath}/${href}`, 'utf8')
  element.outerHTML = `<style>${cssText}</style>`
})

queryAll('link[href][ss:repeat-glob]').forEach(element => {
  const href = element.getAttribute('href')
  if (!href) { return }
  globSync(href, { cwd: docsOutputPath }).forEach(value => {
    const link = document.createElement('link')
    for (const { name, value } of element.attributes) {
      link.setAttribute(name, value)
    }
    link.removeAttribute('ss:repeat-glob')
    link.setAttribute('href', value)
    element.insertAdjacentElement('afterend', link)
  })
  element.remove()
})

queryAll('[ss:toc]').forEach(element => {
  const ol = document.createElement('ol')
  /** @type {[HTMLElement, HTMLElement][]} */
  const path = []
  for (const element of queryAll('h1, h2, h3, h4, h5, h6')) {
    if (element.matches('.no-toc')) {
      continue
    }
    const id = element.getAttribute('id') || element.textContent.trim().toLowerCase().replaceAll(/\s+/g, '-')
    if (!element.hasAttribute('id')) {
      element.setAttribute('id', id)
    }
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = `#${id}`
    a.textContent = element.textContent
    li.append(a)

    const parent = (() => {
      while (path.length > 0) {
        const [title, possibleParent] = path.at(-1)
        if (title.tagName < element.tagName) {
          const possibleParentList = possibleParent.querySelector('ol')
          if (!possibleParentList) {
            const ol = document.createElement('ol')
            possibleParent.append(ol)
            return ol
          }
          return possibleParentList
        }
        path.pop()
      }
      return ol
    })()
    parent.append(li)
    path.push([element, li])
  }
  element.replaceWith(ol)
})

const minifiedHtml = minify('<!DOCTYPE html>' + document.documentElement?.outerHTML || '', {
  removeAttributeQuotes: true,
  useShortDoctype: true,
  collapseWhitespace: true,
})

fs.writeFileSync(`${docsOutputPath}/${process.argv[2]}`, minifiedHtml)

function dedent (templateStrings, ...values) {
  const matches = []
  const strings = typeof templateStrings === 'string' ? [templateStrings] : templateStrings.slice()
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '')
  for (const string of strings) {
    const match = string.match(/\n[\t ]+/g)
    match && matches.push(...match)
  }
  if (matches.length) {
    const size = Math.min(...matches.map(value => value.length - 1))
    const pattern = new RegExp(`\n[\t ]{${size}}`, 'g')
    for (let i = 0; i < strings.length; i++) {
      strings[i] = strings[i].replace(pattern, '\n')
    }
  }

  strings[0] = strings[0].replace(/^\r?\n/, '')
  let string = strings[0]
  for (let i = 0; i < values.length; i++) {
    string += values[i] + strings[i + 1]
  }
  return string
}
