import { Editor, Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { SlashCommandsMenu, SlashCommandsMenuProps } from "./command-menu";
import tippy from "tippy.js";
import { ISlashCommandItem } from "@/types";
import { getSlashCommandFilteredSections } from "./command-items-list";

export type SlashCommandOptions = {
  suggestion: Omit<SuggestionOptions, "editor">;
};

const Command = Extension.create<SlashCommandOptions>({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        allow({ editor }) {
          const { selection } = editor.state;

          const parentNode = selection.$from.node(selection.$from.depth);
          const blockType = parentNode.type.name;

          if (blockType === "codeBlock") return false;
          if (editor.isActive("table")) return false;

          return true;
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});

interface CommandListInstance {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const renderItems = () => {
  let component: ReactRenderer<CommandListInstance, SlashCommandsMenuProps> | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect?: (() => DOMRect | null) | null }) => {
      component = new ReactRenderer(SlashCommandsMenu, {
        props,
        editor: props.editor,
      });

      const tippyContainer =
        document.querySelector(".active-editor") ?? document.querySelector('[id^="editor-container"]');
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: tippyContainer,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

export const SlashCommands = (additionalOptions?: ISlashCommandItem[]) =>
  Command.configure({
    suggestion: {
      items: getSlashCommandFilteredSections(additionalOptions),
      render: renderItems,
    },
  });
