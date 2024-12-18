import { TCollaborativeEditorProps } from "@/types";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { useEditor } from "./use-editor";
import { DocumentEditorAdditionalExtensions } from "@/plane-editor/extensions/document-extensions";
import Collaboration from "@tiptap/extension-collaboration";

export const useCollaborativeEditor = ({
  onTransaction,
  disabledExtensions,
  editorClassName,
  editorProps = {},
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
}: TCollaborativeEditorProps) => {
  // states
  const [hasServerConnectionFailed, setHasServerConnectionFailed] = useState(false);
  const [hasServerSynced, setHasServerSynced] = useState(false);
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        name: id,
        parameters: realtimeConfig.queryParams,
        // using user id as a token to verify the user on the server
        token: JSON.stringify(user),
        url: realtimeConfig.url,
        onAuthenticationFailed: () => {
          serverHandler.onServerError?.();
          setHasServerConnectionFailed(true);
        },
        onConnect: () => serverHandler?.onConnect(),
        onClose: (data) => {
          if (data.event.code === 1006) {
            serverHandler?.onServerError?.();
            setHasServerConnectionFailed(true);
          }
        },
        onSynced: () => setHasServerSynced(true),
      }),
    [id, realtimeConfig, serverHandler, user]
  );

  // destroy and disconnect connection on unmount
  useEffect(
    () => () => {
      provider.destroy();
      provider.disconnect();
    },
    [provider]
  );
  // indexed db integration for offline support
  useLayoutEffect(() => {
    const localProvider = new IndexeddbPersistence(id, provider.document);
    return () => {
      localProvider?.destroy();
    };
  }, [provider, id]);

  const editor = useEditor({
    id,
    onTransaction,
    editorProps,
    editorClassName,
    enableHistory: false,
    extensions: [
      Collaboration.configure({
        document: provider.document,
      }),
      ...(extensions ?? []),
      ...DocumentEditorAdditionalExtensions({
        disabledExtensions,
        issueEmbedConfig: embedHandler?.issue,
        provider,
        userDetails: user,
      }),
    ],
    fileHandler,
    handleEditorReady,
    forwardedRef,
    mentionHandler,
    placeholder,
    provider,
    tabIndex,
  });

  return {
    editor,
    hasServerConnectionFailed,
    hasServerSynced,
  };
};
