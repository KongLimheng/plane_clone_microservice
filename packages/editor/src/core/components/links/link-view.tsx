import { Editor } from "@tiptap/react";
import { CSSProperties, useEffect, useState } from "react";
import { LinkPreview } from "./link-preview";

export interface LinkViewProps {
  view?: "LinkPreview" | "LinkEditView" | "LinkInputView";
  editor: Editor;
  from: number;
  to: number;
  url: string;
  closeLinkView: () => void;
}

export const LinkView = (props: LinkViewProps & { style: CSSProperties }) => {
  const [currentView, setCurrentView] = useState(props.view ?? "LinkInputView");
  const [prevFrom, setPrevFrom] = useState(props.from);

  const switchView = (view: "LinkPreview" | "LinkEditView" | "LinkInputView") => {
    setCurrentView(view);
  };

  useEffect(() => {
    if (props.from !== prevFrom) {
      setCurrentView("LinkPreview");
      setPrevFrom(props.from);
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "LinkPreview":
        return <LinkPreview viewProps={props} switchView={switchView} />;
    }
  };

  return renderView();
};
