import { Editor, EditorContent } from "@tiptap/react";
import { ReactNode } from "react";

interface EditorContentProps {
  children?: ReactNode;
  editor: Editor | null;
  id: string;
  tabIndex?: number;
}

export const EditorContentWrapper = ({ editor, children, id, tabIndex }: EditorContentProps) => (
  <div tabIndex={tabIndex} onFocus={() => editor.chain().focus(undefined, { scrollIntoView: false }).run()}>
    <EditorContent editor={editor} />
    {children}
  </div>
);
