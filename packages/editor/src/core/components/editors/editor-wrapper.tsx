import { DEFAULT_DISPLAY_CONFIG } from "@/constants/config";
import { getEditorClassNames } from "@/helpers/common";
import { useEditor } from "@/hooks/use-editor";
import { IEditorProps } from "@/types";
import { Editor, Extension } from "@tiptap/core";
import { EditorContainer } from "./editor-container";
import { EditorContentWrapper } from "./editor-content";

type Props = IEditorProps & {
  children?: (editor: Editor) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extensions: Extension<any, any>[];
};

export const EditorWrapper = ({
  children,
  containerClassName,
  displayConfig = DEFAULT_DISPLAY_CONFIG,
  editorClassName = "",
  extensions,
  id,
  initialValue,
  fileHandler,
  forwardedRef,
  mentionHandler,
  onChange,
  onTransaction,
  handleEditorReady,
  autofocus,
  placeholder,
  tabIndex,
  value,
}: Props) => {
  const editor = useEditor({
    editorClassName,
    enableHistory: true,
    extensions,
    fileHandler,
    forwardedRef,
    id,
    initialValue,
    mentionHandler,
    onChange,
    onTransaction,
    handleEditorReady,
    autofocus,
    placeholder,
    tabIndex,
    value,
  });

  const editorContainerClassName = getEditorClassNames({
    noBorder: true,
    borderOnFocus: false,
    containerClassName,
  });

  if (!editor) return null;

  return (
    <EditorContainer
      displayConfig={displayConfig}
      editor={editor}
      editorContainerClassName={editorContainerClassName}
      id={id}
    >
      {children?.(editor)}
      <div className="flex flex-col">
        <EditorContentWrapper editor={editor} id={id} tabIndex={tabIndex} />
      </div>
    </EditorContainer>
  );
};
