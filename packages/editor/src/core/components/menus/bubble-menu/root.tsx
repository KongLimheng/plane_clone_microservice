import { BubbleMenu, BubbleMenuProps, isNodeSelection } from "@tiptap/react";
import { useState } from "react";
import { BoldItem, CodeItem, EditorMenuItem, ItalicItem, StrikeThroughItem, UnderLineItem } from "../menu-item";
import { isCellSelection } from "@/extensions/table/utilties/is-cell-selection";
import { TEditorCommands } from "@/types";
import { TextAlignmentSelector } from "./alignment-selector";
import { BubbleMenuNodeSelector } from "./node-selector";
import { cn } from "@plane/utils";

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children">;

export const EditorBubbleMenu = (props: EditorBubbleMenuProps) => {
  // states
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const basicFormattingOptions = props.editor.isActive("code")
    ? [CodeItem(props.editor)]
    : [BoldItem(props.editor), ItalicItem(props.editor), UnderLineItem(props.editor), StrikeThroughItem(props.editor)];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ state, editor }) => {
      const { selection } = state;
      const { empty } = selection;

      if (
        empty ||
        !editor.isEditable ||
        editor.isActive("image") ||
        isNodeSelection(selection) ||
        isCellSelection(selection) ||
        isSelecting
      ) {
        return false;
      }
      return true;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsLinkSelectorOpen(false);
        setIsColorSelectorOpen(false);
      },
    },
  };
  return (
    <BubbleMenu
      className="flex py-2 divide-x divide-custom-border-200 rounded-lg bg-custom-background-100 shadow-custom-shadow-rg"
      {...bubbleMenuProps}
    >
      {!isSelecting && (
        <>
          <div className="px-2">
            {!props.editor.isActive("table") && (
              <BubbleMenuNodeSelector
                editor={props.editor}
                isOpen={isNodeSelectorOpen}
                setIsOpen={() => {
                  setIsNodeSelectorOpen((prev) => !prev);
                  setIsLinkSelectorOpen(false);
                  setIsColorSelectorOpen(false);
                }}
              />
            )}
          </div>
          <div className="flex gap-0.5 px-2">
            {basicFormattingOptions.map((item: EditorMenuItem<TEditorCommands>) => (
              <button
                key={item.key}
                type="button"
                onClick={(e) => {
                  item.command();
                  e.stopPropagation();
                }}
                className={cn(
                  "size-7 grid place-items-center rounded text-custom-text-300 hover:bg-custom-background-80 active:bg-custom-background-80 transition-colors",
                  {
                    "bg-custom-background-80 text-custom-text-100": item.isActive(),
                  }
                )}
              >
                <item.icon className="size-4" />
              </button>
            ))}
          </div>

          <TextAlignmentSelector
            editor={props.editor}
            onClose={() => {
              const editor = props.editor;
              if (!editor) return;
              const pos = editor.state.selection.to;
              editor.commands.setTextSelection(pos ?? 0);
            }}
          />
        </>
      )}
    </BubbleMenu>
  );
};
