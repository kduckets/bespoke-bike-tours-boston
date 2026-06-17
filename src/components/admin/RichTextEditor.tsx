'use client'
import { useState, useEffect } from 'react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/core'

// ── Extensions ────────────────────────────────────────────────────────────────

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, string | null>) =>
            attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
})

const EXTENSIONS = [
  StarterKit.configure({ heading: false }),
  Underline,
  TextStyle,
  Color,
  FontSize,
  TextAlign.configure({ types: ['paragraph', 'listItem'] }),
]

// ── Toolbar atoms (defined at module level — NOT inside the component) ────────
// Defining components inside another component creates a new type every render,
// causing React to unmount/remount them mid-interaction and lose events.

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

function ToolbarBtn({
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

// ── Content helper ─────────────────────────────────────────────────────────────
// Existing content saved as plain text (before rich-text was added) arrives
// without any HTML tags. Tiptap parses that as a single text run, collapsing
// all newlines into spaces and producing one uneditable blob. Detect plain text
// and convert paragraph breaks to <p> elements before handing to Tiptap.

function prepareContent(raw: string): string {
  if (!raw) return ''
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw          // already HTML — pass through
  return raw
    .split(/\n{2,}/)                                    // split on blank lines
    .map(p => p.trim().replace(/\n/g, '<br>'))          // single newlines → <br>
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('')
}

// ── Toolbar ────────────────────────────────────────────────────────────────────
// Deliberately NOT using useEditorState (which uses useSyncExternalStore and
// forces synchronous React re-renders mid-transaction). Synchronous re-renders
// during ProseMirror's mousedown handling race with focus management and cause
// the cursor to appear then immediately disappear.
//
// Instead we subscribe via editor.on() inside useEffect. setState calls from
// ProseMirror event listeners are treated by React 18 as deferred updates —
// they batch and flush AFTER the current browser event finishes, so the
// re-render never interferes with focus.

function Toolbar({ editor }: { editor: Editor }) {
  const [state, setState] = useState({
    bold: false, italic: false, underline: false,
    bulletList: false, orderedList: false,
    alignLeft: false, alignCenter: false, alignRight: false,
  })

  useEffect(() => {
    const sync = () => setState({
      bold:        editor.isActive('bold'),
      italic:      editor.isActive('italic'),
      underline:   editor.isActive('underline'),
      bulletList:  editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      alignLeft:   editor.isActive({ textAlign: 'left' }),
      alignCenter: editor.isActive({ textAlign: 'center' }),
      alignRight:  editor.isActive({ textAlign: 'right' }),
    })
    editor.on('selectionUpdate', sync)
    editor.on('update', sync)
    return () => { editor.off('selectionUpdate', sync); editor.off('update', sync) }
  }, [editor])

  const cmd = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn() }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 flex-wrap bg-white/[0.02]">
      {/* Inline format */}
      <ToolbarBtn active={state.bold}
        onMouseDown={cmd(() => editor.chain().focus().toggleBold().run())} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn active={state.italic}
        onMouseDown={cmd(() => editor.chain().focus().toggleItalic().run())} title="Italic (Ctrl+I)">
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn active={state.underline}
        onMouseDown={cmd(() => editor.chain().focus().toggleUnderline().run())} title="Underline (Ctrl+U)">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolbarBtn>

      <Sep />

      {/* Alignment */}
      <ToolbarBtn active={state.alignLeft}
        onMouseDown={cmd(() => editor.chain().focus().setTextAlign('left').run())} title="Align left">
        <AlignLeftIcon />
      </ToolbarBtn>
      <ToolbarBtn active={state.alignCenter}
        onMouseDown={cmd(() => editor.chain().focus().setTextAlign('center').run())} title="Align center">
        <AlignCenterIcon />
      </ToolbarBtn>
      <ToolbarBtn active={state.alignRight}
        onMouseDown={cmd(() => editor.chain().focus().setTextAlign('right').run())} title="Align right">
        <AlignRightIcon />
      </ToolbarBtn>

      <Sep />

      {/* Lists */}
      <ToolbarBtn active={state.bulletList}
        onMouseDown={cmd(() => editor.chain().focus().toggleBulletList().run())} title="Bullet list">
        • List
      </ToolbarBtn>
      <ToolbarBtn active={state.orderedList}
        onMouseDown={cmd(() => editor.chain().focus().toggleOrderedList().run())} title="Numbered list">
        1. List
      </ToolbarBtn>

      <Sep />

      {/* Font size */}
      <select
        title="Font size"
        defaultValue=""
        onMouseDown={e => e.stopPropagation()}
        onChange={e => {
          const val = e.target.value
          editor.chain().focus().setMark('textStyle', { fontSize: val || null }).run()
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
            onMouseDown={cmd(() => editor.chain().focus().setColor(hex).run())}
            className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition-transform"
            style={{ backgroundColor: hex }}
          />
        ))}
        <label title="Custom color" className="cursor-pointer relative">
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
          <span className="w-3.5 h-3.5 rounded-full border border-white/30 block"
                style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />
        </label>
      </div>

      <Sep />

      <ToolbarBtn
        onMouseDown={cmd(() => editor.chain().focus().clearNodes().unsetAllMarks().run())}
        title="Clear formatting">
        ✕ Clear
      </ToolbarBtn>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function RichTextEditor({ value, onChange, minHeight = 96 }: Props) {
  // Compute initial content once and freeze it. Every render calls prepareContent(value)
  // and returns a new string object; Tiptap v3 treats any new reference in the content
  // option as a content change and calls setContent(), which resets the editor and kills
  // the cursor — making it impossible to click and type in pre-filled fields.
  const [initialContent] = useState(() => prepareContent(value))

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: initialContent,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'outline-none text-sm text-white leading-relaxed',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  if (!editor) return null

  return (
    <div className="rounded border border-white/10 bg-white/5 focus-within:border-[var(--iris)] transition-colors overflow-hidden">
      <Toolbar editor={editor} />
      <div
        className="px-3 py-2.5"
        onMouseDown={(e) => {
          // Only act when the click landed on this padding div itself, not on
          // the contenteditable inside it. If e.target === e.currentTarget the
          // user clicked below/around the text (padding area). Calling
          // preventDefault stops the browser from blurring the editor when
          // clicking a non-focusable element; then we explicitly focus.
          if (e.target === e.currentTarget) {
            e.preventDefault()
            editor.commands.focus()
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
