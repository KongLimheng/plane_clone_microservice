// styles
// import "./styles/tailwind.css";
import "./styles/variables.css";
import "./styles/editor.css";
import "./styles/table.css";
import "./styles/github-dark.css";
import "./styles/drag-drop.css";

export { RichTextEditorWithRef, CollaborativeDocumentEditorWithRef } from "@/components/editors";
// helpers
export * from "@/helpers/common";
export * from "@/helpers/editor-commands";
export * from "@/helpers/yjs";

// components
export * from "@/components/menus";

// hooks
export { useEditor } from "@/hooks/use-editor";

// types
export type { CustomEditorProps } from "@/hooks/use-editor";
export * from "@/types";
