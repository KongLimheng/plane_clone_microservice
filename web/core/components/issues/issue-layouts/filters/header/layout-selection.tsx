import { Tooltip } from "@plane/ui";
import { EIssueLayoutTypes, ISSUE_LAYOUTS } from "@/constants/issue";
import { cn } from "@/helpers/common.helper";
import { usePlatformOS } from "@/hooks/use-platform-os";

type Props = {
  layouts: EIssueLayoutTypes[];
  onChange: (layout: EIssueLayoutTypes) => void;
  selectedLayout: EIssueLayoutTypes | undefined;
};

export const LayoutSelection = ({ selectedLayout, onChange, layouts }: Props) => {
  const { isMobile } = usePlatformOS();

  const handleOnChange = (layoutKey: EIssueLayoutTypes) => {
    if (selectedLayout !== layoutKey) {
      onChange(layoutKey);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded bg-custom-background-80 p-1">
      {ISSUE_LAYOUTS.filter((l) => layouts.includes(l.key)).map((layout) => (
        <Tooltip key={layout.key} tooltipContent={layout.title} isMobile={isMobile}>
          <button
            type="button"
            className={cn(
              "group grid h-[22px] w-7 place-items-center overflow-hidden rounded transition-all hover:bg-custom-background-100",
              {
                "bg-custom-background-100 shadow-custom-shadow-2xs": selectedLayout === layout.key,
              }
            )}
            onClick={() => handleOnChange(layout.key)}
          >
            <layout.icon
              size={14}
              strokeWidth={2}
              className={cn(
                "size-3.5",
                selectedLayout === layout.key ? "text-custom-text-100" : "text-custom-text-200"
              )}
            />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};
