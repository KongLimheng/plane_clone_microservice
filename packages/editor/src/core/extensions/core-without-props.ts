import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { CustomTextAlignExtension } from "./text-align";
import { CustomCodeInlineExtension } from "./code-inline";
import { IssueWidgetWithoutProps } from "./issue-embed";

export const CoreEditorExtensionsWithoutProps = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc pl-7 space-y-2",
      },
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
    dropcursor: false,
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2 space-y-2",
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: "flex",
    },
    nested: true,
  }),
  CustomCodeInlineExtension,
  CustomTextAlignExtension,
];

export const DocumentEditorExtensionsWithoutProps = [IssueWidgetWithoutProps()];
