import { EditorState } from "@tiptap/pm/state";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface EditorClassNames {
  noBorder?: boolean;
  borderOnFocus?: boolean;
  containerClassName?: string;
}

export const getEditorClassNames = ({ noBorder, borderOnFocus, containerClassName }: EditorClassNames) =>
  cn(
    "w-full max-w-full sm:rounded-lg focus:outline-none focus:border-0",
    {
      "border border-custom-border-200": !noBorder,
      "focus:border border-custom-border-300": borderOnFocus,
    },
    containerClassName
  );

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getParagraphCount = (editorState: EditorState | undefined) => {
  if (!editorState) return 0;
  let paragraphCount = 0;
  editorState.doc.descendants((node) => {
    if (node.type.name === "paragraph" && node.content.size > 0) paragraphCount++;
  });
  return paragraphCount;
};
