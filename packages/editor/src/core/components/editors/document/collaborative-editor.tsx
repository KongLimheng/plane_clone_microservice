import { DEFAULT_DISPLAY_CONFIG } from "@/constants/config";
import { getEditorClassNames } from "@/helpers/common";
import { useCollaborativeEditor } from "@/hooks/use-collaborative-editor";
import { EditorRefApi, ICollaborativeDocumentEditor } from "@/types";
import { DocumentContentLoader } from "./loader";
import React from "react";
import { PageRenderer } from "./page-renderer";

const CollaborativeDocumentEditor = ({
  onTransaction,
  aiHandler,
  containerClassName,
  disabledExtensions,
  displayConfig = DEFAULT_DISPLAY_CONFIG,
  editorClassName = "",
  embedHandler,
  fileHandler,
  forwardedRef,
  handleEditorReady,
  id,
  mentionHandler,
  placeholder,
  realtimeConfig,
  serverHandler,
  tabIndex,
  user,
}: ICollaborativeDocumentEditor) => {
  const extensions = [];
  // if(embedHandler.issue){

  // }

  // use document editor
  const { editor, hasServerConnectionFailed, hasServerSynced } = useCollaborativeEditor({
    onTransaction,
    disabledExtensions,
    editorClassName,
    embedHandler,
    extensions,
    fileHandler,
    forwardedRef,
    handleEditorReady,
    id,
    mentionHandler,
    placeholder,
    realtimeConfig,
    serverHandler,
    tabIndex,
    user,
  });

  const editorContainerClassNames = getEditorClassNames({
    noBorder: true,
    borderOnFocus: false,
    containerClassName,
  });
  if (!editor) return null;
  if (!hasServerSynced && !hasServerConnectionFailed) return <DocumentContentLoader />;

  return (
    <PageRenderer
      displayConfig={displayConfig}
      aiHandler={aiHandler}
      editor={editor}
      editorContainerClassName={editorContainerClassNames}
      id={id}
      tabIndex={tabIndex}
    />
  );
};

const CollaborativeDocumentEditorWithRef = React.forwardRef<EditorRefApi, ICollaborativeDocumentEditor>(
  (props, ref) => (
    <CollaborativeDocumentEditor {...props} forwardedRef={ref as React.MutableRefObject<EditorRefApi | null>} />
  )
);

CollaborativeDocumentEditorWithRef.displayName = "CollaborativeDocumentEditorWithRef";

export { CollaborativeDocumentEditorWithRef };
