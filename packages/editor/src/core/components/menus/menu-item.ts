import {
  setText,
  setTextAlign,
  toggleBold,
  toggleCodeBlock,
  toggleItalic,
  toggleStrike,
  toggleUnderline,
} from "@/helpers/editor-commands";
import { TCommandWithProps, TEditorCommands } from "@/types";
import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  BoldIcon,
  CaseSensitive,
  CodeIcon,
  ItalicIcon,
  LucideIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

type isActiveFunction<T extends TEditorCommands> = (params?: TCommandWithProps<T>) => boolean;
type commandFunction<T extends TEditorCommands> = (params?: TCommandWithProps<T>) => void;

export type EditorMenuItem<T extends TEditorCommands> = {
  key: T;
  name: string;
  command: commandFunction<T>;
  icon: LucideIcon;
  isActive: isActiveFunction<T>;
};

export const TextItem = (editor: Editor): EditorMenuItem<"text"> => ({
  key: "text",
  name: "Text",
  isActive: () => editor.isActive("paragraph"),
  command: () => setText(editor),
  icon: CaseSensitive,
});

export const CodeItem = (editor: Editor): EditorMenuItem<"code"> => ({
  key: "code",
  name: "Code",
  isActive: () => editor?.isActive("code") || editor?.isActive("codeBlock"),
  command: () => toggleCodeBlock(editor),
  icon: CodeIcon,
});

export const BoldItem = (editor: Editor): EditorMenuItem<"bold"> => ({
  key: "bold",
  name: "Bold",
  isActive: () => editor?.isActive("bold"),
  command: () => toggleBold(editor),
  icon: BoldIcon,
});

export const ItalicItem = (editor: Editor): EditorMenuItem<"italic"> => ({
  key: "italic",
  name: "Italic",
  isActive: () => editor?.isActive("italic"),
  command: () => toggleItalic(editor),
  icon: ItalicIcon,
});

export const UnderLineItem = (editor: Editor): EditorMenuItem<"underline"> => ({
  key: "underline",
  name: "Underline",
  isActive: () => editor?.isActive("underline"),
  command: () => toggleUnderline(editor),
  icon: UnderlineIcon,
});

export const StrikeThroughItem = (editor: Editor): EditorMenuItem<"strikethrough"> => ({
  key: "strikethrough",
  name: "Strikethrough",
  isActive: () => editor?.isActive("strike"),
  command: () => toggleStrike(editor),
  icon: StrikethroughIcon,
});

export const TextAlignItem = (editor: Editor): EditorMenuItem<"text-align"> => ({
  key: "text-align",
  name: "Text align",
  isActive: ({ alignment }) => editor.isActive({ textAlign: alignment }),
  command: ({ alignment }) => setTextAlign(alignment, editor),
  icon: AlignCenter,
});

export const getEditorMenuItems = (editor: Editor | null): EditorMenuItem<TEditorCommands>[] => {
  if (!editor) return [];

  return [
    TextItem(editor),
    BoldItem(editor),
    ItalicItem(editor),
    UnderLineItem(editor),
    StrikeThroughItem(editor),
    // BulletListItem(editor),
    // TodoListItem(editor),
    CodeItem(editor),
    // NumberedListItem(editor),
    // QuoteItem(editor),
    // TableItem(editor),
    // ImageItem(editor),
    // HorizontalRuleItem(editor),
    // TextColorItem(editor),
    // BackgroundColorItem(editor),
    TextAlignItem(editor),
  ];
};
