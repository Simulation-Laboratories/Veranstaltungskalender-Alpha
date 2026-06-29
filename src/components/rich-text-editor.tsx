"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react"

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2 border rounded-md',
      },
    },
    onUpdate: ({ editor }) => {
      // We export HTML, but Tiptap handles markdown shortcuts on input naturally!
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 border p-1 rounded-md bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold') ? 'true' : undefined}
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic') ? 'true' : undefined}
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-6 bg-border mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor.isActive('heading', { level: 2 }) ? 'true' : undefined}
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-6 bg-border mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList') ? 'true' : undefined}
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList') ? 'true' : undefined}
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
