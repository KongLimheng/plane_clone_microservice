import { Editor } from "@tiptap/core";
import { Dispatch, SetStateAction } from "react";
import { CodeItem, EditorMenuItem, TextItem } from "../menu-item";
import { Check, ChevronDown } from "lucide-react";
import { TEditorCommands } from "@/types";
import { cn } from "@plane/utils";

type Props = {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const BubbleMenuNodeSelector = ({ editor, isOpen, setIsOpen }: Props) => {
  const items: EditorMenuItem<TEditorCommands>[] = [
    TextItem(editor),
    // HeadingOneItem(editor),
    // HeadingTwoItem(editor),
    // HeadingThreeItem(editor),
    // HeadingFourItem(editor),
    // HeadingFiveItem(editor),
    // HeadingSixItem(editor),
    // BulletListItem(editor),
    // NumberedListItem(editor),
    // TodoListItem(editor),
    // QuoteItem(editor),
    CodeItem(editor),
  ];

  const activeItem = items.filter((item) => item.isActive()).pop() ?? {
    name: "Multiple",
  };

  return (
    <div className="relative h-full">
      <button
        className="flex items-center gap-1 h-full whitespace-nowrap px-3 text-sm font-medium text-custom-text-300 hover:bg-custom-background-80 active:bg-custom-background-80 transition-colors rounded"
        type="button"
        onClick={(e) => {
          setIsOpen(isOpen);
          e.stopPropagation();
        }}
      >
        <span>{activeItem?.name}</span>
        <ChevronDown className="flex-shrink-0 size-3" />
      </button>
      {isOpen && (
        <section className="fixed top-full z-[999999] mt-1 flex w-48 flex-col overflow-hidden rounded-md border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 shadow-custom-shadow-rg animate-in fade-in slide-in-from-top-1">
          {items.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={(e) => {
                item.command();
                setIsOpen(false);
                e.stopPropagation();
              }}
              className={cn(
                "flex items-center justify-between rounded px-1 py-1.5 text-sm text-custom-text-200 hover:bg-custom-background-80",
                { "bg-custom-background-80": activeItem.name === item.name }
              )}
            >
              <div className="flex items-center space-x-2">
                <item.icon className="size-3 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {activeItem.name === item.name && <Check className="size-3 text-custom-text-300 flex-shrink-0" />}
            </button>
          ))}
        </section>
      )}
    </div>
  );
};
