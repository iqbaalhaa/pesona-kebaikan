'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const DraftEditor = dynamic(() => import('react-draft-wysiwyg').then(m => m.Editor), { ssr: false });

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const initial = React.useMemo(() => {
    try {
      if (value && value.trim()) {
        const blocks = convertFromHTML(value);
        const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
        return EditorState.createWithContent(content);
      }
    } catch {}
    return EditorState.createEmpty();
  }, [value]);

  const [state, setState] = React.useState<EditorState>(initial);
  const [mounted, setMounted] = React.useState(false);

  const uploadImage = React.useCallback((file: File): Promise<{ data: { link: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('failed'));
      reader.onload = () => {
        resolve({ data: { link: String(reader.result) } });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const toolbar = React.useMemo(() => ({
    options: ['inline', 'blockType', 'list', 'link', 'image', 'history'],
    inline: { options: ['bold', 'italic', 'underline'] },
    list: { options: ['unordered', 'ordered'] },
    image: {
      urlEnabled: true,
      uploadEnabled: true,
      uploadCallback: uploadImage,
      previewImage: true,
      alignmentEnabled: true,
      inputAccept: 'image/*'
    }
  }), [uploadImage]);

  React.useEffect(() => {
    setMounted(true);
    // sync external value if it changes notably (e.g., when loading existing content)
    // recreate state only when HTML differs from current content
    try {
      const currentHtml = draftToHtml(convertToRaw(state.getCurrentContent()));
      if (value && value.trim() && currentHtml.trim() !== value.trim()) {
        const blocks = convertFromHTML(value);
        const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
        setState(EditorState.createWithContent(content));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (s: EditorState) => {
    setState(s);
    const raw = convertToRaw(s.getCurrentContent());
    onChange(draftToHtml(raw));
  };

  if (!mounted) {
    return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] min-h-[180px]" />;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a]">
      <DraftEditor
        editorState={state}
        onEditorStateChange={handleChange}
        toolbar={toolbar}
        editorStyle={{ minHeight: 180, padding: 12 }}
        toolbarClassName="border-b border-gray-200 dark:border-gray-700"
      />
    </div>
  );
}
