"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick, active, disabled, children, title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()} // keep editor focus/selection
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 6, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "rgba(34,132,192,0.15)" : "transparent",
        color: active ? "#2284C0" : "#5A7A96",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, padding: "6px 8px",
      borderBottom: "1.5px solid rgba(16,64,107,0.1)", background: "#F7F8FA",
      borderRadius: "10px 10px 0 0", flexWrap: "wrap",
    }}>
      <ToolbarButton title="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton title="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </ToolbarButton>
      <div style={{ width: 1, height: 18, background: "rgba(16,64,107,0.12)", margin: "0 4px" }} />
      <ToolbarButton title="Titre" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton title="Sous-titre" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={14} />
      </ToolbarButton>
      <div style={{ width: 1, height: 18, background: "rgba(16,64,107,0.12)", margin: "0 4px" }} />
      <ToolbarButton title="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton title="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={14} />
      </ToolbarButton>
      <div style={{ width: 1, height: 18, background: "rgba(16,64,107,0.12)", margin: "0 4px" }} />
      <ToolbarButton title="Annuler" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton title="Rétablir" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo size={14} />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 110 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style: `padding: 12px 14px; min-height: ${minHeight}px; font-size: 13px; color: #0D2137; font-family: 'DM Sans',sans-serif; outline: none;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  return (
    <div className="rte-content" style={{
      border: "1.5px solid rgba(16,64,107,0.12)", borderRadius: 10,
      background: "#FAFAF8", overflow: "hidden",
    }}>
      <Toolbar editor={editor} />
      <div style={{ position: "relative" }}>
        {editor?.isEmpty && placeholder && (
          <div style={{
            position: "absolute", top: 12, left: 14, fontSize: 13,
            color: "#9BAFC0", fontFamily: "'DM Sans',sans-serif", pointerEvents: "none",
          }}>
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .rte-content .ProseMirror p { margin: 0 0 8px; }
        .rte-content .ProseMirror h2 { font-size: 17px; font-weight: 800; font-family: 'Fraunces',serif; color: #0D2137; margin: 10px 0 6px; }
        .rte-content .ProseMirror h3 { font-size: 15px; font-weight: 700; color: #0D2137; margin: 8px 0 4px; }
        .rte-content .ProseMirror ul { list-style-type: disc; list-style-position: outside; padding-left: 20px; margin: 4px 0; }
        .rte-content .ProseMirror ol { list-style-type: decimal; list-style-position: outside; padding-left: 20px; margin: 4px 0; }
        .rte-content .ProseMirror li { margin: 2px 0; }
        .rte-content .ProseMirror strong { font-weight: 700; }
        .rte-content .ProseMirror em { font-style: italic; }
        `}</style>
    </div>
  );
}