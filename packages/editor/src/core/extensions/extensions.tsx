import { IMentionHighlight, IMentionSuggestion, TFileHandler } from "@/types";
import StarterKit from "@tiptap/starter-kit";
import { CustomQuoteExtension } from "./quote";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import TiptapUnderline from "@tiptap/extension-underline";
import { Markdown } from "tiptap-markdown";
import { CustomCodeBlockExtension } from "./code";
import { CustomMention } from "./mentions";
import { CustomTextAlignExtension } from "./text-align";
import { CustomCodeInlineExtension } from "./code-inline";
import { CustomCodeMarkPlugin } from "./custom-code-inline";
import { CustomHorizontalRule } from "./horizontal-rule";

type TArguments = {
  enableHistory: boolean;
  fileHandler: TFileHandler;
  mentionConfig: {
    mentionSuggestions?: () => Promise<IMentionSuggestion[]>;
    mentionHighlights?: () => Promise<IMentionHighlight[]>;
  };
  placeholder?: string | ((isFocused: boolean, value: string) => string);
  tabIndex?: number;
};

export const CoreEditorExtensions = ({
  enableHistory,
  fileHandler,
  mentionConfig,
  placeholder,
  tabIndex,
}: TArguments) => [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: { class: "list-disc pl-7 space-y-2" },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal pl-7 space-y-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "not-prose space-y-2",
      },
    },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    blockquote: false,
    dropcursor: {
      class: "text-custom-text-300",
    },
    ...(enableHistory ? {} : { history: false }),
  }),
  CustomQuoteExtension,
  CustomHorizontalRule.configure({
    HTMLAttributes: { class: "py-4 border-custom-border-400" },
  }),
  TiptapUnderline,
  TextStyle,
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2 space-y-2",
    },
  }),

  TaskItem.configure({
    HTMLAttributes: {
      class: "relative",
    },
    nested: true,
  }),
  CustomCodeBlockExtension.configure({
    HTMLAttributes: {
      class: "",
    },
  }),
  CustomCodeMarkPlugin,
  CustomCodeInlineExtension,
  Markdown.configure({
    html: true,
    transformPastedText: true,
    breaks: true,
  }),
  CustomMention({
    mentionHighlights: mentionConfig.mentionHighlights,
    mentionSuggestions: mentionConfig.mentionSuggestions,
    readonly: false,
  }),
  Placeholder.configure({
    placeholder: ({ editor, node }) => {
      if (node.type.name === "heading") return `Heading ${node.attrs.level}`;
      if (editor.storage.imageComponent?.uploadInProgress) return "";
      const shouldHidePlaceholder =
        editor.isActive("table") ||
        editor.isActive("codeBlock") ||
        editor.isActive("image") ||
        editor.isActive("imageComponent");

      if (shouldHidePlaceholder) return "";
      if (placeholder) {
        if (typeof placeholder === "string") return placeholder;
        return placeholder(editor.isFocused, editor.getHTML());
      }

      return "Press '/' for commands...";
    },
    includeChildren: true,
  }),
  CharacterCount,
  CustomTextAlignExtension,
];
