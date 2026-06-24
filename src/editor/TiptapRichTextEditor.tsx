'use client';

import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

export interface TiptapRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TiptapRichTextEditor: React.FC<TiptapRichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[120px] rounded border border-slate-200 bg-white p-3 text-sm outline-none',
      },
    },
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 text-xs">
        <button type="button" className="rounded border px-2 py-1" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="rounded border px-2 py-1" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="rounded border px-2 py-1" onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          Underline
        </button>
        <button type="button" className="rounded border px-2 py-1" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
