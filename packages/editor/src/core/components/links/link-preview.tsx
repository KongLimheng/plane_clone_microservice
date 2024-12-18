import { GlobeIcon } from "lucide-react";
import { LinkViewProps } from "./link-view";

export const LinkPreview = ({
  viewProps,
  switchView,
}: {
  viewProps: LinkViewProps;
  switchView: (view: "LinkPreview" | "LinkEditView" | "LinkInputView") => void;
}) => {
  const { editor, from, to, url } = viewProps;

  return (
    <div>
      <div>
        <GlobeIcon size={14} className="inline-block" />
      </div>
    </div>
  );
};
