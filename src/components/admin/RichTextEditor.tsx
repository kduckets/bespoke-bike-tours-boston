'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  EditorState,
  LexicalEditor,
  $createParagraphNode,
  $createTextNode,
} from 'lexical'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $getNearestNodeOfType } from '@lexical/utils'
import { $isHeadingNode } from '@lexical/rich-text'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

// ── Content helpers ────────────────────────────────────────────────────────────

function isHtml(str: string) {
  return /<[a-z][\s\S]*>/i.test(str)
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim().replace(/\n/g, '<br>'))
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('')
}

// ── Toolbar state hook ─────────────────────────────────────────────────────────

function useToolbarState(editor: LexicalEditor) {
  const [state, setState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isBulletList: false,
    isOrderedList: false,
    align: 'left' as string,
    fontSize: '' as string,
    fontColor: '' as string,
  })

  const update = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()

      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)

      setState({
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isBulletList: $isListNode(element) && (element as ListNode).getListType() === 'bullet',
        isOrderedList: $isListNode(element) && (element as ListNode).getListType() === 'number',
        align: (elementDOM?.style.textAlign) || 'left',
        fontSize: '',
        fontColor: '',
      })
    })
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(update)
    })
  }, [editor, update])

  return state
}

// ── Font size / color via inline styles ────────────────────────────────────────
// Lexical doesn't have built-in font-size/color commands, so we use
// the selection API to apply inline CSS on the selected text nodes.

function applyInlineStyle(editor: LexicalEditor, property: string, value: string | null) {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    const nodes = selection.getNodes()
    for (const node of nodes) {
      if ('setStyle' in node && typeof (node as any).setStyle === 'function') {
        const current = (node as any).getStyle() as string
        const styles = parseStyles(current)
        if (value === null) {
          delete styles[property]
        } else {
          styles[property] = value
        }
        ;(node as any).setStyle(serializeStyles(styles))
      }
    }
  })
}

function parseStyles(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of styleStr.split(';')) {
    const [k, v] = part.split(':').map(s => s.trim())
    if (k && v) result[k] = v
  }
  return result
}

function serializeStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SIZES = ['11px', '13px', '15px', '18px', '22px', '28px', '36px']

const COLORS = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#F5C842', label: 'Gold' },
  { hex: '#9B91E0', label: 'Iris' },
  { hex: '#8B88B8', label: 'Muted' },
  { hex: '#4ade80', label: 'Green' },
  { hex: '#f87171', label: 'Red' },
  { hex: '#60a5fa', label: 'Blue' },
]

// ── SVG icons ──────────────────────────────────────────────────────────────────

function AlignLeftIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="currentColor">
      <rect x="0" y="0" width="13" height="2" rx="1"/>
      <rect x="0" y="4.5" width="9" height="2" rx="1"/>
      <rect x="0" y="9" width="11" height="2" rx="1"/>
    </svg>
  )
}
function AlignCenterIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="currentColor">
      <rect x="0" y="0" width="13" height="2" rx="1"/>
      <rect x="2" y="4.5" width="9" height="2" rx="1"/>
      <rect x="1" y="9" width="11" height="2" rx="1"/>
    </svg>
  )
}
function AlignRightIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="currentColor">
      <rect x="0" y="0" width="13" height="2" rx="1"/>
      <rect x="4" y="4.5" width="9" height="2" rx="1"/>
      <rect x="2" y="9" width="11" height="2" rx="1"/>
    </svg>
  )
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

function Btn({
  active, onMouseDown, title, children,
}: {
  active?: boolean
  onMouseDown: (e: React.MouseEvent) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`px-2 py-1 rounded text-xs font-mono transition-colors select-none ${
        active ? 'bg-gold/20 text-gold' : 'text-muted hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-white/15 mx-0.5 self-center" />
}

// ── Toolbar (uses composer context internally) ─────────────────────────────────

function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const ts = useToolbarState(editor)

  const cmd = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault()
    fn()
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 flex-wrap bg-white/[0.02]">
      {/* Inline */}
      <Btn active={ts.isBold}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'))}
        title="Bold (Ctrl+B)">
        <strong>B</strong>
      </Btn>
      <Btn active={ts.isItalic}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'))}
        title="Italic (Ctrl+I)">
        <em>I</em>
      </Btn>
      <Btn active={ts.isUnderline}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'))}
        title="Underline (Ctrl+U)">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </Btn>

      <Sep />

      {/* Alignment */}
      <Btn active={ts.align === 'left' || ts.align === ''}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'))}
        title="Align left">
        <AlignLeftIcon />
      </Btn>
      <Btn active={ts.align === 'center'}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'))}
        title="Align center">
        <AlignCenterIcon />
      </Btn>
      <Btn active={ts.align === 'right'}
        onMouseDown={e => cmd(e, () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'))}
        title="Align right">
        <AlignRightIcon />
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn active={ts.isBulletList}
        onMouseDown={e => cmd(e, () => {
          if (ts.isBulletList) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
          else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        })}
        title="Bullet list">
        • List
      </Btn>
      <Btn active={ts.isOrderedList}
        onMouseDown={e => cmd(e, () => {
          if (ts.isOrderedList) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
          else editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        })}
        title="Numbered list">
        1. List
      </Btn>

      <Sep />

      {/* Font size */}
      <select
        title="Font size"
        defaultValue=""
        onMouseDown={e => e.stopPropagation()}
        onChange={e => {
          const val = e.target.value || null
          applyInlineStyle(editor, 'font-size', val)
          e.target.value = ''
        }}
        className="text-[11px] bg-transparent text-muted border border-white/10 rounded px-1 py-0.5 cursor-pointer hover:border-white/30 focus:outline-none"
      >
        <option value="">Size</option>
        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <Sep />

      {/* Color swatches */}
      <div className="flex items-center gap-1">
        {COLORS.map(({ hex, label }) => (
          <button
            key={hex}
            type="button"
            title={label}
            onMouseDown={e => {
              e.preventDefault()
              applyInlineStyle(editor, 'color', hex)
            }}
            className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition-transform"
            style={{ backgroundColor: hex }}
          />
        ))}
        <label title="Custom color" className="cursor-pointer relative">
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onChange={e => applyInlineStyle(editor, 'color', e.target.value)}
          />
          <span className="w-3.5 h-3.5 rounded-full border border-white/30 block"
            style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />
        </label>
      </div>

      <Sep />

      {/* Clear formatting */}
      <Btn
        onMouseDown={e => cmd(e, () => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              selection.getNodes().forEach(node => {
                if ('setStyle' in node && typeof (node as any).setStyle === 'function') {
                  ;(node as any).setStyle('')
                }
                if ('setFormat' in node && typeof (node as any).setFormat === 'function') {
                  ;(node as any).setFormat(0)
                }
              })
            }
          })
        })}
        title="Clear formatting">
        ✕ Clear
      </Btn>
    </div>
  )
}

// ── HTML initializer plugin ────────────────────────────────────────────────────
// Loads the initial HTML (or plain text) into the Lexical editor once on mount.

function InitialContentPlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !initialHtml) return
    initialized.current = true

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(initialHtml, 'text/html')
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodes)
    })
  }, [editor, initialHtml])

  return null
}

// ── OnChange → HTML plugin ─────────────────────────────────────────────────────

function HtmlOutputPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null)
      onChange(html)
    })
  }, [editor, onChange])

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

// ── Editor theme ───────────────────────────────────────────────────────────────

const THEME = {
  paragraph: 'mb-2 last:mb-0',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
  list: {
    ul: 'list-disc ml-4 mb-2',
    ol: 'list-decimal ml-4 mb-2',
    listitem: 'mb-1',
  },
}

// ── Main export ────────────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange, minHeight = 96 }: Props) {
  const initialHtml = isHtml(value) ? value : plainTextToHtml(value)

  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: THEME,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error: Error) => console.error('[Lexical]', error),
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rounded border border-white/10 bg-white/5 focus-within:border-[var(--iris)] transition-colors overflow-hidden">
        <Toolbar />
        <div className="px-3 py-2.5 relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none text-sm text-white leading-relaxed"
                style={{ minHeight }}
                aria-label="Rich text editor"
              />
            }
            placeholder={
              <div className="absolute top-[10px] left-3 text-sm text-muted pointer-events-none select-none">
                Start typing…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <HistoryPlugin />
          <InitialContentPlugin initialHtml={initialHtml} />
          <HtmlOutputPlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  )
}
