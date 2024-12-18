import { Editor } from "@tiptap/core";
import { TextAlignItem } from "../menu-item";
import { TEditorCommands } from "@/types";
import { AlignCenter, AlignLeft, AlignRight, LucideIcon } from "lucide-react";
import { cn } from "@/helpers/common";

type Props = {
  editor: Editor;
  onClose: () => void;
};

export const TextAlignmentSelector = ({ editor, onClose }: Props) => {
  const menuItem = TextAlignItem(editor);
  const textAlignmentOptions: {
    itemKey: TEditorCommands;
    renderKey: string;
    icon: LucideIcon;
    command: () => void;
    isActive: () => boolean;
  }[] = [
    {
      itemKey: "text-align",
      renderKey: "text-align-left",
      icon: AlignLeft,
      command: () =>
        menuItem.command({
          alignment: "left",
        }),
      isActive: () =>
        menuItem.isActive({
          alignment: "left",
        }),
    },
    {
      itemKey: "text-align",
      renderKey: "text-align-center",
      icon: AlignCenter,
      command: () =>
        menuItem.command({
          alignment: "center",
        }),
      isActive: () =>
        menuItem.isActive({
          alignment: "center",
        }),
    },
    {
      itemKey: "text-align",
      renderKey: "text-align-right",
      icon: AlignRight,
      command: () =>
        menuItem.command({
          alignment: "right",
        }),
      isActive: () =>
        menuItem.isActive({
          alignment: "right",
        }),
    },
  ];

  return (
    <div className="flex gap-0.5 px-2">
      {textAlignmentOptions.map((item) => (
        <button
          type="button"
          className={cn(
            "size-7 grid place-items-center rounded text-custom-text-300 hover:bg-custom-background-80 active:bg-custom-background-80 transition-colors",
            {
              "bg-custom-background-80 text-custom-text-100": item.isActive(),
            }
          )}
          key={item.renderKey}
          onClick={(e) => {
            e.stopPropagation();
            item.command();
            onClose();
          }}
        >
          <item.icon className="size-4" />
        </button>
      ))}
    </div>
  );
};
