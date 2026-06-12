'use client'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

// Font-size stored as an inline style on TextStyle marks
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => (el as HTMLElement).style.fontSize || null,
          renderHTML: (attrs: Record<string, string | null>) =>
            attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
})

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

interface Props {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function RichTextEditor({ value, onChange, minHeight = 96 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      Color,
      FontSize,
    ],
    content: value || '',
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

  function Btn({
    active, onClick, title, children,
  }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
    return (
      <button
        type="button"
        title={title}
        onMouseDown={e => { e.preventDefault(); onClick() }}
        className={`px-2 py-1 rounded text-xs font-mono transition-colors select-none ${
          active ? 'bg-gold/20 text-gold' : 'text-muted hover:text-white hover:bg-white/10'
        }`}
      >
        {children}
      </button>
    )
  }

  const Sep = () => <div className="w-px h-4 bg-white/15 mx-0.5 self-center" />

  return (
    <div className="rounded border border-white/10 bg-white/5 focus-within:border-[var(--iris)] transition-colors overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 flex-wrap bg-white/[0.02]">
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <em>I</em>
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </Btn>

        <Sep />

        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          • List
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1. List
        </Btn>

        <Sep />

        {/* Font size */}
        <select
          title="Font size"
          defaultValue=""
          onMouseDown={e => e.stopPropagation()}
          onChange={e => {
            const val = e.target.value
            if (val) {
              editor.chain().focus().setMark('textStyle', { fontSize: val }).run()
            } else {
              editor.chain().focus().setMark('textStyle', { fontSize: null }).run()
            }
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
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(hex).run() }}
              className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition-transform"
              style={{ backgroundColor: hex }}
            />
          ))}
          {/* Custom color */}
          <label title="Custom color" className="cursor-pointer relative">
            <input
              type="color"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            />
            <span className="w-3.5 h-3.5 rounded-full border border-white/30 block"
                  style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
          </label>
        </div>

        <Sep />

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          ✕ Clear
        </Btn>
      </div>

      {/* ── Editor area ── */}
      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
