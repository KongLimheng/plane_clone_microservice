import { IMentionHighlight } from "@/types";
import { cn } from "@plane/utils";
import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";

export const MentionNodeView = (props) => {
  const [highlightsState, setHighlightsState] = useState<IMentionHighlight[]>();

  useEffect(() => {
    if (!props.extension.options.mentionHighlights) return;
    const hightlights = async () => {
      const userId = await props.extension.options.mentionHighlights?.();
      setHighlightsState(userId);
    };
    hightlights();
  }, [props.extension.options]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!props.node.attrs.redirect_uri) {
      event.preventDefault();
    }
  };

  return (
    <NodeViewWrapper className="mention-component inline w-fit">
      <a
        href={props.node.attrs.redirect_uri || "#"}
        target="_blank"
        className={cn("mention rounded bg-custom-primary-100/20 px-1 py-0.5 font-medium text-custom-primary-100", {
          "bg-yellow-500/20 text-yellow-500": highlightsState
            ? highlightsState.includes(props.node.attrs.entity_identifier)
            : false,
          "cursor-pointer": !props.extension.options.readonly,
        })}
      >
        @{props.node.attrs.label}
      </a>
    </NodeViewWrapper>
  );
};
