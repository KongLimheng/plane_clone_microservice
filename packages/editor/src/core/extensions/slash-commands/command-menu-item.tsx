import { ISlashCommandItem } from "@/types";
import { cn } from "@plane/utils";

type Props = {
  isSelected: boolean;
  item: ISlashCommandItem;
  itemIndex: number;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onMouseEnter: () => void;
  sectionIndex: number;
};

export const CommandMenuItem = ({ isSelected, item, itemIndex, onClick, onMouseEnter, sectionIndex }: Props) => (
  <button
    className={cn(
      "flex items-center gap-2 w-full rounded px-1 py-1.5 text-sm text-left truncate text-custom-text-200",
      { "bg-custom-background-80": isSelected }
    )}
    type="button"
    id={`item-${sectionIndex}-${itemIndex}`}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    <span className="size-5 grid place-items-center flex-shrink-0" style={item.iconContainerStyle}>
      {item.icon}
    </span>
    <p className="flex-grow truncate">{item.title}</p>
  </button>
);
