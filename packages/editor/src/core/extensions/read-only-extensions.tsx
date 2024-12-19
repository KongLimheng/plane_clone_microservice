import { IMentionHighlight, TExtensions, TFileHandler } from "@/types";
import { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { CustomQuoteExtension } from "./quote";
import { CustomHorizontalRule } from "./horizontal-rule";
import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CustomCodeBlockExtension } from "./code";
import { Markdown } from "tiptap-markdown";
import { CustomMention } from "./mentions";
import CharacterCount from "@tiptap/extension-character-count";
import { CustomTextAlignExtension } from "./text-align";

type Props = {
  disabledExtensions: TExtensions[];
  fileHandler: Pick<TFileHandler, "getAssetSrc">;
  mentionConfig: {
    mentionHighlights?: () => Promise<IMentionHighlight[]>;
  };
};

export const CoreReadOnlyEditorExtensions = (props: Props): Extensions => {
  const { disabledExtensions, fileHandler, mentionConfig } = props;

  return [
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
      paragraph: {
        HTMLAttributes: {
          class: "editor-paragraph-block",
        },
      },
      heading: {
        HTMLAttributes: {
          class: "editor-heading-block",
        },
      },
      dropcursor: false,
      gapcursor: false,
    }),
    CustomQuoteExtension,
    CustomHorizontalRule.configure({
      HTMLAttributes: {
        class: "py-4 border-custom-border-400",
      },
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
        class: "relative pointer-events-none",
      },
      nested: true,
    }),
    CustomCodeBlockExtension.configure({
      HTMLAttributes: {
        class: "",
      },
    }),
    Markdown.configure({
      html: true,
      transformCopiedText: true,
    }),
    CustomMention({
      mentionHighlights: mentionConfig.mentionHighlights,
      readonly: true,
    }),
    CharacterCount,
    CustomTextAlignExtension,
  ];
};
