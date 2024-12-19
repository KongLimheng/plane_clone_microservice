import { setText } from "@/helpers/editor-commands";
import { coreEditorAdditionalSlashCommandOptions } from "@/plane-editor/extensions/slash-commands";
import { CommandProps, ISlashCommandItem, TExtensions } from "@/types";
import {
  CaseSensitive,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  MessageSquareText,
  MinusSquare,
  Table,
  TextQuote,
} from "lucide-react";
import { TSlashCommandAdditionalOption } from "./root";

export type TSlashCommandSection = {
  key: string;
  title?: string;
  items: ISlashCommandItem[];
};

type TArgs = {
  additionalOptions?: TSlashCommandAdditionalOption[];
  disabledExtensions: TExtensions[];
};

export const getSlashCommandFilteredSections =
  (args: TArgs) =>
  ({ query }: { query: string }): TSlashCommandSection[] => {
    const { additionalOptions, disabledExtensions } = args;

    const SLASH_COMMAND_SECTIONS: TSlashCommandSection[] = [
      {
        key: "general",
        items: [
          {
            commandKey: "text",
            key: "text",
            title: "text",
            description: "Just start typing with plain text.",
            searchTerms: ["p", "paragraph"],
            icon: <CaseSensitive className="size-3.5" />,
            command: ({ editor, range }) => setText(editor, range),
          },
          // {
          //   commandKey: "h1",
          //   key: "h1",
          //   title: "Heading 1",
          //   description: "Big section heading.",
          //   searchTerms: ["title", "big", "large"],
          //   icon: <Heading1 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingOne(editor, range),
          // },
          // {
          //   commandKey: "h2",
          //   key: "h2",
          //   title: "Heading 2",
          //   description: "Medium section heading.",
          //   searchTerms: ["subtitle", "medium"],
          //   icon: <Heading2 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingTwo(editor, range),
          // },
          // {
          //   commandKey: "h3",
          //   key: "h3",
          //   title: "Heading 3",
          //   description: "Small section heading.",
          //   searchTerms: ["subtitle", "small"],
          //   icon: <Heading3 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingThree(editor, range),
          // },
          // {
          //   commandKey: "h4",
          //   key: "h4",
          //   title: "Heading 4",
          //   description: "Small section heading.",
          //   searchTerms: ["subtitle", "small"],
          //   icon: <Heading4 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingFour(editor, range),
          // },
          // {
          //   commandKey: "h5",
          //   key: "h5",
          //   title: "Heading 5",
          //   description: "Small section heading.",
          //   searchTerms: ["subtitle", "small"],
          //   icon: <Heading5 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingFive(editor, range),
          // },
          // {
          //   commandKey: "h6",
          //   key: "h6",
          //   title: "Heading 6",
          //   description: "Small section heading.",
          //   searchTerms: ["subtitle", "small"],
          //   icon: <Heading6 className="size-3.5" />,
          //   command: ({ editor, range }) => toggleHeadingSix(editor, range),
          // },
          // {
          //   commandKey: "to-do-list",
          //   key: "to-do-list",
          //   title: "To do",
          //   description: "Track tasks with a to-do list.",
          //   searchTerms: ["todo", "task", "list", "check", "checkbox"],
          //   icon: <ListTodo className="size-3.5" />,
          //   command: ({ editor, range }) => toggleTaskList(editor, range),
          // },
          // {
          //   commandKey: "bulleted-list",
          //   key: "bulleted-list",
          //   title: "Bullet list",
          //   description: "Create a simple bullet list.",
          //   searchTerms: ["unordered", "point"],
          //   icon: <List className="size-3.5" />,
          //   command: ({ editor, range }) => toggleBulletList(editor, range),
          // },
          // {
          //   commandKey: "numbered-list",
          //   key: "numbered-list",
          //   title: "Numbered list",
          //   description: "Create a list with numbering.",
          //   searchTerms: ["ordered"],
          //   icon: <ListOrdered className="size-3.5" />,
          //   command: ({ editor, range }) => toggleOrderedList(editor, range),
          // },
          // {
          //   commandKey: "table",
          //   key: "table",
          //   title: "Table",
          //   description: "Create a table",
          //   searchTerms: ["table", "cell", "db", "data", "tabular"],
          //   icon: <Table className="size-3.5" />,
          //   command: ({ editor, range }) => insertTableCommand(editor, range),
          // },
          // {
          //   commandKey: "quote",
          //   key: "quote",
          //   title: "Quote",
          //   description: "Capture a quote.",
          //   searchTerms: ["blockquote"],
          //   icon: <TextQuote className="size-3.5" />,
          //   command: ({ editor, range }) => toggleBlockquote(editor, range),
          // },
          {
            commandKey: "code",
            key: "code",
            title: "Code",
            description: "Capture a code snippet.",
            searchTerms: ["codeblock"],
            icon: <Code2 className="size-3.5" />,
            command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
          },
          // {
          //   commandKey: "image",
          //   key: "image",
          //   title: "Image",
          //   icon: <ImageIcon className="size-3.5" />,
          //   description: "Insert an image",
          //   searchTerms: ["img", "photo", "picture", "media", "upload"],
          //   command: ({ editor, range }: CommandProps) => insertImage({ editor, event: "insert", range }),
          // },
          // {
          //   commandKey: "callout",
          //   key: "callout",
          //   title: "Callout",
          //   icon: <MessageSquareText className="size-3.5" />,
          //   description: "Insert callout",
          //   searchTerms: ["callout", "comment", "message", "info", "alert"],
          //   command: ({ editor, range }: CommandProps) => insertCallout(editor, range),
          // },
          {
            commandKey: "divider",
            key: "divider",
            title: "Divider",
            description: "Visually divide blocks.",
            searchTerms: ["line", "divider", "horizontal", "rule", "separate"],
            icon: <MinusSquare className="size-3.5" />,
            command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
          },
        ],
      },
    ];

    [
      ...(additionalOptions ?? []),
      ...coreEditorAdditionalSlashCommandOptions({
        disabledExtensions,
      }),
    ]?.forEach((item) => {
      const sectionToPushTo = SLASH_COMMAND_SECTIONS.find((s) => s.key === item.section) ?? SLASH_COMMAND_SECTIONS[0];
      const itemIndexToPushAfter = sectionToPushTo.items.findIndex((i) => i.commandKey === item.pushAfter);
      if (itemIndexToPushAfter !== -1) {
        sectionToPushTo.items.splice(itemIndexToPushAfter + 1, 0, item);
      } else {
        sectionToPushTo.items.push(item);
      }
    });

    const filteredSlashSections = SLASH_COMMAND_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (typeof query !== "string") return;

        const lowercaseQuery = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery) ||
          item.searchTerms.some((t) => t.includes(lowercaseQuery))
        );
      }),
    }));

    return filteredSlashSections.filter((s) => s.items.length !== 0);
  };
