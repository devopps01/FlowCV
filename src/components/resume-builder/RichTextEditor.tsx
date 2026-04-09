'use client';

import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, val = '') => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#f8fafc] focus-within:ring-2 focus-within:ring-[#ff4d7d] transition-all">
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white shadow-sm overflow-x-auto custom-scrollbar">
        <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 font-bold" title="Bold">B</button>
        <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 italic" title="Italic">I</button>
        <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 underline" title="Underline">U</button>
        <div className="w-px h-6 bg-gray-100 mx-1"></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600" title="Bullet List">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <div className="w-px h-6 bg-gray-100 mx-1"></div>
        <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/></svg>
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[120px] outline-none text-sm text-gray-700 font-medium bg-white"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
      ></div>
    </div>
  );
};

export default RichTextEditor;
