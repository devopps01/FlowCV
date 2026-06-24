'use client';

import React, { useEffect, useRef, memo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import TextColor from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import {
  Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Strikethrough, RemoveFormatting, Underline as UnderlineIcon, Heading1, Heading2,
  Quote, Code, Link, Highlighter, Palette,
} from 'lucide-react';

/* ─── Extension Builder ─── */
const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    bulletList: { keepMarks: true, keepAttributes: true },
    orderedList: { keepMarks: true, keepAttributes: true },
  }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
  TextStyle,
  TextColor,
  Highlight,
  LinkExtension.configure({ openOnClick: false }),
];

interface CoverLetterBodyEditorProps {
  content: string;
  onChange: (html: string) => void;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  lineHeight?: number;
  paragraphSpacing?: number;
}

function CoverLetterBodyEditorInner({
  content, onChange,
  fontFamily = 'Inter', fontSize = 14, fontColor = '#374151', lineHeight = 1.8, paragraphSpacing = 12,
}: CoverLetterBodyEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isFromEditor = useRef(false);
  const lastExternalContent = useRef<string | null>(null);
  const styleApplied = useRef(false);

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] p-4',
        style: `font-family: "${fontFamily}", sans-serif; font-size: ${fontSize}px; color: ${fontColor}; line-height: ${lineHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      isFromEditor.current = true;
      onChange(editor.getHTML());
    },
  });

  // Push external content changes (e.g. AI generation) into editor
  useEffect(() => {
    if (!editor) return;
    if (isFromEditor.current) {
      isFromEditor.current = false;
      return;
    }
    if (content !== lastExternalContent.current && content !== editor.getHTML()) {
      const newHtml = content?.startsWith('<') || content?.includes('<p>')
        ? content
        : (content ? content.split(/\n\n+/).map((p: string) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('') : '<p></p>');
      editor.commands.setContent(newHtml, false);
      lastExternalContent.current = content;
    }
  }, [content, editor]);

  // Apply font/style props directly to DOM — never resets content or cursor
  useEffect(() => {
    if (!editor || typeof window === 'undefined') return;
    const dom = editor.view?.dom;
    if (!dom) return;

    dom.style.setProperty('font-family', `"${fontFamily}", sans-serif`);
    dom.style.setProperty('font-size', `${fontSize}px`);
    dom.style.setProperty('color', fontColor);
    dom.style.setProperty('line-height', String(lineHeight));

    // Also apply to the editor wrapper to avoid flash
    const wrapper = dom.closest('.ProseMirror') as HTMLElement | null;
    if (wrapper) {
      wrapper.style.setProperty('font-family', `"${fontFamily}", sans-serif`);
      wrapper.style.setProperty('font-size', `${fontSize}px`);
      wrapper.style.setProperty('color', fontColor);
      wrapper.style.setProperty('line-height', String(lineHeight));
    }

    styleApplied.current = true;
  }, [editor, fontFamily, fontSize, fontColor, lineHeight]);

  if (!editor) return null;

  /** Toolbar button with active state detection */
  const Btn = ({ action, active, title, children }: { action: () => void; active?: boolean | (() => boolean); title: string; children: React.ReactNode }) => {
    const isActive = typeof active === 'function' ? active() : active;
    return (
      <button type="button" onMouseDown={e => { e.preventDefault(); action(); }} title={title}
        className={`px-2 py-1 rounded text-xs transition-colors ${isActive ? 'bg-[var(--app-primary)] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
        {children}
      </button>
    );
  };

  /** Separator line */
  const Sep = () => <span className="w-px h-5 mx-1" style={{ background: 'var(--app-border)' }} />;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ borderColor: 'var(--app-border)' }}>
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b" style={{ background: 'var(--app-bg-gray)', borderColor: 'var(--app-border)' }}>
        {/* Formatting */}
        <Btn action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code className="w-3.5 h-3.5" /></Btn>

        <Sep />

        {/* Text Color */}
        <Btn action={() => colorInputRef.current?.click()} active={false} title="Text Color">
          <div className="relative"><Palette className="w-3.5 h-3.5" />
            <input ref={colorInputRef} type="color" className="absolute inset-0 opacity-0 w-0 h-0" onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
          </div>
        </Btn>

        {/* Highlight */}
        <Btn action={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-3.5 h-3.5" /></Btn>

        <Sep />

        {/* Headings */}
        <Btn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>
        <Btn action={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">¶</Btn>

        <Sep />

        {/* Blockquote */}
        <Btn action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-3.5 h-3.5" /></Btn>

        {/* Code Block */}
        <Btn action={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code className="w-3.5 h-3.5" /></Btn>

        <Sep />

        {/* Lists */}
        <Btn action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></Btn>

        <Sep />

        {/* Alignment */}
        <Btn action={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></Btn>
        <Btn action={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></Btn>

        <Sep />

        {/* Link */}
        <Btn action={() => { const url = prompt('Enter URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive('link')} title="Insert Link"><Link className="w-3.5 h-3.5" /></Btn>

        {/* Clear formatting */}
        <Btn action={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting className="w-3.5 h-3.5" /></Btn>
      </div>

      {/* ─── Editor Content ─── */}
      <EditorContent editor={editor} />
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders due to unrelated state changes
export default memo(CoverLetterBodyEditorInner);