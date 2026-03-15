import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Bold,
  Italic
} from "lucide-react";

import "./RichTextEditor.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
};

type ToolbarButtonProps = {
  title: string;
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

function ToolbarButton({
  title,
  isActive = false,
  onClick,
  children,
  className = "",
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rte__icon-btn ${isActive ? "is-active" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  onImageUpload,
}: RichTextEditorProps) {

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyleKit,
      Image,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  function setFontSize(size: string) {
    if (!editor) return;
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  }

  async function handleImageFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = event.target.files?.[0];

    if (!file || !editor || !onImageUpload) return;

    try {

      const imageUrl = await onImageUpload(file);

      editor.chain().focus().setImage({ src: imageUrl }).run();

    } catch (error) {

      console.error(error);
      alert("Impossible d'envoyer l'image.");

    } finally {

      event.target.value = "";

    }

  }

  if (!editor) return null;

  return (
    <div className="rte">

      <div className="rte__toolbar">

        <div className="rte__group">

          <ToolbarButton
            title="Gras"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Italique"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic size={18} />
          </ToolbarButton>

        </div>

        <div className="rte__group">

          <ToolbarButton
            title="Titre H1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            className="rte__icon-btn--heading"
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            title="Titre H2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            className="rte__icon-btn--heading"
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            title="Titre H3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            className="rte__icon-btn--heading"
          >
            H3
          </ToolbarButton>

        </div>

        <div className="rte__group">

          <ToolbarButton
            title="Liste à puces"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Liste numérotée"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Citation"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote size={18} />
          </ToolbarButton>

        </div>

        <div className="rte__group">

          <ToolbarButton
            title="Image"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={18} />
          </ToolbarButton>

        </div>

        <div className="rte__group">

          <ToolbarButton
            title="Aligner à gauche"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
          >
            <AlignLeft size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Centrer"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
          >
            <AlignCenter size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Aligner à droite"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
          >
            <AlignRight size={18} />
          </ToolbarButton>

        </div>

        <div className="rte__group">

          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                setFontSize(event.target.value);
              }
            }}
          >
            <option value="">Taille</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="22px">22</option>
            <option value="28px">28</option>
          </select>

        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageFileChange}
        />

      </div>

      <EditorContent editor={editor} className="rte__content" />

    </div>
  );
}