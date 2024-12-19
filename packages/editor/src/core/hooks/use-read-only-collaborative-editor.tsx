import { TReadOnlyCollaborativeEditorProps } from "@/types";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useMemo, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { useReadOnlyEditor } from "./use-read-only-editor";
import Collaboration from "@tiptap/extension-collaboration";

export const useReadOnlyCollaborativeEditor = (props: TReadOnlyCollaborativeEditorProps) => {
  const {
    disabledExtensions,
    editorClassName,
    editorProps = {},
    extensions,
    fileHandler,
    forwardedRef,
    handleEditorReady,
    id,
    mentionHandler,
    realtimeConfig,
    serverHandler,
    user,
  } = props;

  // states
  const [hasServerConnectionFailed, setHasServerConnectionFailed] = useState(false);
  const [hasServerSynced, setHasServerSynced] = useState(false);
  // initialize Hocuspocus provider
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        name: id,
        url: realtimeConfig.url,
        token: JSON.stringify(user),
        parameters: realtimeConfig.queryParams,
        onAuthenticationFailed: () => {
          serverHandler?.onServerError?.();
          setHasServerConnectionFailed(true);
        },
        onConnect: () => serverHandler?.onConnect?.(),
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

  // indexed db integration for offline support
  const localProvider = useMemo(
    () => (id ? new IndexeddbPersistence(id, provider.document) : undefined),
    [id, provider]
  );

  // destroy and disconnect connection on unmount
  useEffect(
    () => () => {
      provider.destroy();
      localProvider?.destroy();
    },
    [provider, localProvider]
  );

  const editor = useReadOnlyEditor({
    disabledExtensions,
    editorProps,
    editorClassName,
    extensions: [
      ...(extensions ?? []),
      Collaboration.configure({
        document: provider.document,
      }),
    ],
    fileHandler,
    forwardedRef,
    handleEditorReady,
    mentionHandler,
    provider,
  });

  return {
    editor,
    hasServerConnectionFailed,
    hasServerSynced,
  };
};
