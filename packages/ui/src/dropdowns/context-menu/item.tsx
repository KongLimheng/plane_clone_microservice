import { cn } from "../../../helpers";
import { TContextMenuItem } from "./root";
import React from "react";

type ContextMenuItemProps = {
  handleActiveItem: () => void;
  handleClose: () => void;
  isActive: boolean;
  item: TContextMenuItem;
};

export const ContextMenuItem = ({ handleActiveItem, handleClose, isActive, item }: ContextMenuItemProps) => {
  if (item.shouldRender === false) return null;

  return (
    <button
      type="button"
      className={cn(
        "w-full flex items-center gap-2 px-1 py-1.5 text-left text-custom-text-200 rounded text-xs select-none",
        {
          "bg-custom-background-90": isActive,
          "text-custom-text-400": item.disabled,
        },
        item.className
      )}
      onMouseEnter={handleActiveItem}
      disabled={item.disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action();
        if (item.closeOnClick !== false) handleClose();
      }}
    >
      {item.icon && <item.icon className={cn("size-3", item.iconClassName)} />}
      <div>
        <h5>{item.title}</h5>
        {item.description && (
          <p
            className={cn("text-custom-text-300 whitespace-pre-line", {
              "text-custom-text-400": item.disabled,
            })}
          >
            {item.description}
          </p>
        )}
      </div>
    </button>
  );
};
