import { EditorRefApi, IRichTextEditor } from "@/types";
import { forwardRef, useCallback } from "react";
import { EditorWrapper } from "../editor-wrapper";
import { EditorBubbleMenu } from "@/components/menus";
import { SlashCommands } from "@/extensions/slash-commands";

const RichTextEditor = (props: IRichTextEditor) => {
  const { disabledExtensions, dragDropEnabled, bubbleMenuEnabled = true, extensions: externalExtensions = [] } = props;

  const getExtensions = useCallback(() => {
    const extensions = [...externalExtensions];

    if (!disabledExtensions?.includes("slash-commands")) {
      extensions.push(
        SlashCommands({
          disabledExtensions,
        })
      );
    }

    return extensions;
  }, [dragDropEnabled, disabledExtensions, externalExtensions]);

  return (
    <EditorWrapper {...props} extensions={getExtensions()}>
      {(editor) => <>{editor && bubbleMenuEnabled && <EditorBubbleMenu editor={editor} />}</>}
    </EditorWrapper>
  );
};

const RichTextEditorWithRef = forwardRef<EditorRefApi, IRichTextEditor>((props, ref) => (
  <RichTextEditor {...props} forwardedRef={ref as React.MutableRefObject<EditorRefApi | null>} />
));

RichTextEditorWithRef.displayName = "RichTextEditorWithRef";

export { RichTextEditorWithRef };
