import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { highlightSpecialChars, drawSelection, EditorView, keymap } from '@codemirror/view'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

const fg = 'var(--code-color)'
const bg = 'var(--code-bg)'

const darkBackground = bg
const base02 = fg
const cursor = fg
const selection = 'var(--code-bg-selection)'
const base03 = fg
const base05 = fg
const base07 = 'var(--oper-color)'
const highlightBackground = 'var(--code-bg-highlight)'
const base06 = fg
const tooltipBackground = bg

export const theme = EditorView.theme({

  '.cm-content': {
    caretColor: cursor,
    padding: '1em',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection': { backgroundColor: selection },
  '.cm-panels': { backgroundColor: darkBackground, color: base03 },
  '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
  '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
  '.cm-searchMatch': {
    backgroundColor: base02,
    outline: `1px solid ${base03}`,
    color: base07,
  },
  '.cm-line': {
    padding: 0,
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: base05,
    color: base07,
  },
  '.cm-activeLine': { backgroundColor: highlightBackground },
  '.cm-selectionMatch': { backgroundColor: highlightBackground },
  '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
    outline: `1px solid ${base03}`,
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: highlightBackground,
    color: base07,
  },
  '.cm-gutters': {
    borderRight: '1px solid #ffffff10',
    color: base06,
    backgroundColor: darkBackground,
  },
  '.cm-activeLineGutter': {
    backgroundColor: highlightBackground,
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: base02,
  },
  '.cm-tooltip': {
    border: 'none',
    backgroundColor: tooltipBackground,
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: highlightBackground,
      color: base03,
    },
  },
}, { dark: true })

// Use a class highlight style, so we can handle things in CSS.

export const highlightStyle = HighlightStyle.define([
  { tag: tags.atom,      class: 'cmt-atom'      },
  { tag: tags.comment,   class: 'cmt-comment'   },
  { tag: tags.keyword,   class: 'cmt-keyword'   },
  { tag: tags.literal,   class: 'cmt-literal'   },
  { tag: tags.number,    class: 'cmt-number'    },
  { tag: tags.operator,  class: 'cmt-operator'  },
  { tag: tags.separator, class: 'cmt-separator' },
  { tag: tags.string,    class: 'cmt-string'    },
  { tag: tags.name,      class: 'cmt-name'      },
])

const baseExtensions = [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
  ]),
  json(),
  syntaxHighlighting(highlightStyle),
  theme,
  EditorView.contentAttributes.of((e) => ({
    'aria-label': 'code example',
  })),
]

/**
 *
 * @param {object} param0
 * @param {string} param0.doc
 * @param {Element} param0.parent
 * @param {Parameters<typeof EditorView.updateListener.of>[0]} [param0.onChange]
 *
 *
 * @returns
 */
export function createEditorView ({ doc, parent, onChange }) {
  return new EditorView({
    doc,
    extensions: onChange ? baseExtensions.concat(EditorView.updateListener.of(onChange)) : baseExtensions,
    parent,
  })
}
