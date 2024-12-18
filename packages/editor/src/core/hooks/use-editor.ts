import { EditorRefApi, IMentionHighlight, IMentionSuggestion, TEditorCommands, TFileHandler } from "@/types";
import { EditorProps } from "@tiptap/pm/view";
import { MutableRefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEditor as useTiptapEditor, Editor } from "@tiptap/react";
import * as Y from "yjs";
import { CoreEditorProps } from "@/props";
import { CoreEditorExtensions } from "@/extensions";
import { Selection } from "@tiptap/pm/state";
import { insertContentAtSavedSelection } from "@/helpers/insert-content-at-cursor-position";
import { getEditorMenuItems } from "@/components/menus";
import { IMarking, scrollSummary, scrollToNodeViaDOMCoordinates } from "@/helpers/scroll-to-node";
import { DOMSerializer } from "@tiptap/pm/model";
import { getParagraphCount } from "@/helpers/common";

export interface CustomEditorProps {
  editorClassName: string;
  editorProps?: EditorProps;
  enableHistory: boolean;
  extensions?: any;
  fileHandler: TFileHandler;
  forwardedRef?: MutableRefObject<EditorRefApi | null>;
  handleEditorReady?: (value: boolean) => void;
  id?: string;
  initialValue?: string;
  mentionHandler: {
    highlights: () => Promise<IMentionHighlight[]>;
    suggestions?: () => Promise<IMentionSuggestion[]>;
  };
  onChange?: (json: object, html: string) => void;
  onTransaction?: () => void;
  autofocus?: boolean;
  placeholder?: string | ((isFocused: boolean, value: string) => string);
  provider?: HocuspocusProvider;
  tabIndex?: number;
  // undefined when prop is not passed, null if intentionally passed to stop
  // swr syncing
  value?: string | null | undefined;
}

export const useEditor = ({
  editorClassName,
  editorProps = {},
  enableHistory,
  extensions = [],
  fileHandler,
  forwardedRef,
  handleEditorReady,
  id = "",
  initialValue,
  mentionHandler,
  onChange,
  onTransaction,
  placeholder,
  provider,
  tabIndex,
  value,
  autofocus = false,
}: CustomEditorProps) => {
  const [savedSelection, setSavedSelection] = useState<Selection | null>(null);
  // refs
  const editorRef: MutableRefObject<Editor | null> = useRef(null);
  const savedSelectionRef = useRef(savedSelection);

  const editor = useTiptapEditor({
    immediatelyRender: false,
    autofocus,
    editorProps: {
      ...CoreEditorProps({
        editorClassName,
      }),
      ...editorProps,
    },
    extensions: [
      ...CoreEditorExtensions({
        enableHistory,
        fileHandler,
        mentionConfig: {
          mentionHighlights: mentionHandler.highlights,
          mentionSuggestions: mentionHandler.suggestions ?? (() => Promise.resolve<IMentionSuggestion[]>([])),
        },
        placeholder,
        tabIndex,
      }),
      ...extensions,
    ],

    content: typeof initialValue === "string" && initialValue.trim() !== "" ? initialValue : "<p></p>",
    onCreate: () => handleEditorReady?.(true),
    onTransaction: ({ editor }) => {
      setSavedSelection(editor.state.selection);
      onTransaction?.();
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON(), editor.getHTML());
    },
    onDestroy: () => handleEditorReady?.(false),
  });

  // Update the ref whenever savedSelection changes
  useEffect(() => {
    savedSelectionRef.current = savedSelection;
  }, [savedSelection]);

  // Effect for syncing SWR data
  useEffect(() => {
    // value is null when intentionally passed where syncing is not yet
    // supported and value is undefined when the data from swr is not populated
    if (value === null || value === undefined) return;
    if (editor && !editor.isDestroyed && !editor.storage.imageComponents?.uploadInProgress) {
      try {
      } catch (error) {
        console.error("Error syncing editor content with external value:", error);
      }
    }
  }, [editor, value, id]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      blur: () => editorRef.current?.commands.blur(),
      scrollToNodeViaDOMCoordinates(behavior, pos) {
        const resolvedPos = pos ?? savedSelection.from;
        if (!editorRef.current || resolvedPos) return;
        scrollToNodeViaDOMCoordinates(editorRef.current, resolvedPos, behavior);
      },
      getCurrentCursorPosition: () => savedSelection?.from,
      clearEditor: (emitUpdate = false) => {
        editorRef.current?.chain().setMeta("skipImageDeletion", true).clearContent(emitUpdate).run();
      },
      setEditorValue: (content: string) => {
        editorRef.current?.commands.setContent(content, false, { preserveWhitespace: "full" });
      },
      setEditorValueAtCursorPosition: (content: string) => {
        if (savedSelection) {
          insertContentAtSavedSelection(editorRef, content, savedSelection);
        }
      },
      executeMenuItemCommand: (props) => {
        const { itemKey } = props;
        const editorItems = getEditorMenuItems(editorRef.current);
        const getEditorMenuItem = (itemKey: TEditorCommands) => editorItems.find((item) => item.key === itemKey);
        const item = getEditorMenuItem(itemKey);
        if (item) {
          if (item.key === "image") {
            item.command({
              savedSelection: savedSelectionRef.current,
            });
          } else {
            item.command(props);
          }
        } else {
          console.warn(`No command found for item: ${itemKey}`);
        }
      },
      isMenuItemActive: (props) => {
        const { itemKey } = props;
        const editorItems = getEditorMenuItems(editorRef.current);

        const getEditorMenuItem = (itemKey: TEditorCommands) => editorItems.find((item) => item.key === itemKey);
        const item = getEditorMenuItem(itemKey);
        if (!item) return false;

        return item.isActive(props);
      },
      onHeadingChange: (callback: (headings: IMarking[]) => void) => {
        // Subscribe to update event emitted from headers extension
        editorRef.current?.on("update", () => {
          callback(editorRef.current?.storage.headingList.headings);
        });
        // Return a function to unsubscribe to the continuous transactions of
        // the editor on unmounting the component that has subscribed to this
        // method
        return () => {
          editorRef.current?.off("transaction");
        };
      },

      getHeadings: () => editorRef?.current?.storage.headingList.headings,
      onStateChange(callback) {
        // Subscribe to editor state changes
        editorRef.current?.on("transaction", () => {
          callback();
        });

        // Return a function to unsubscribe to the continuous transactions of
        // the editor on unmounting the component that has subscribed to this
        // method
        return () => {
          editorRef.current?.off("transaction");
        };
      },

      getMarkDown: () => {
        const markdownOutput = editorRef.current?.storage.markdown.getMarkdown();
        return markdownOutput;
      },
      getDocument: () => {
        const documentBinary = provider?.document ? Y.encodeStateAsUpdate(provider?.document) : null;
        const documentHTML = editorRef.current?.getHTML() ?? "<p></p>";
        const documentJSON = editorRef.current?.getJSON() ?? null;
        return {
          binary: documentBinary,
          html: documentHTML,
          json: documentJSON,
        };
      },
      scrollSummary: (marking: IMarking) => {
        if (!editorRef.current) return;
        scrollSummary(editorRef.current, marking);
      },
      isEditorReadyToDiscard: () => editorRef.current?.storage?.imageComponent.uploadInProgress === false,
      setFocusAtPosition: (position: number) => {
        if (!editorRef.current || editorRef.current.isDestroyed) {
          console.error("Editor reference is not available or has been destroyed.");
          return;
        }
        try {
          const docSize = editorRef.current.state.doc.content.size;
          const safePosition = Math.max(0, Math.min(position, docSize));
          editorRef.current
            .chain()
            .insertContentAt(safePosition, [{ type: "paragraph" }])
            .focus()
            .run();
        } catch (error) {
          console.error("An error occurred while setting focus at position:", error);
        }
      },
      getSelectedText: () => {
        if (!editorRef.current) return null;

        const { state } = editorRef.current;
        const { from, to, empty } = state.selection;

        if (empty) return null;

        const nodesArray: string[] = [];
        state.doc.nodesBetween(from, to, (node, pos, parent) => {
          if (parent === state.doc && editorRef.current) {
            const serializer = DOMSerializer.fromSchema(editorRef.current?.schema);
            const dom = serializer.serializeNode(node);
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(dom);
            nodesArray.push(tempDiv.innerHTML);
          }
        });
        const selection = nodesArray.join("");
        return selection;
      },
      insertText(contentHTML, insertOnNextLine) {
        if (!editorRef.current) return;
        // get selection
        const { from, to, empty } = editorRef.current.state.selection;
        if (empty) return;
        if (insertOnNextLine) {
          // move cursor to the end of the selection and insert a new line
          editorRef.current
            .chain()
            .focus()
            .setTextSelection(to)
            .insertContent("<br />")
            .insertContent(contentHTML)
            .run();
        } else {
          // replace selected text with the content provided
          editorRef.current.chain().focus().deleteRange({ from, to }).insertContent(contentHTML).run();
        }
      },

      getDocumentInfo: () => ({
        characters: editorRef?.current?.storage?.characterCount?.characters?.() ?? 0,
        paragraphs: getParagraphCount(editorRef?.current?.state),
        words: editorRef?.current?.storage?.characterCount?.words?.() ?? 0,
      }),
      setProviderDocument(value) {
        const document = provider?.document;
        if (!document) return;
        Y.applyUpdate(document, value);
      },
    }),
    [editorRef, savedSelection]
  );

  if (!editor) {
    return null;
  }
  // the editorRef is used to access the editor instance from outside the hook
  // and should only be used after editor is initialized
  editorRef.current = editor;
  return editor;
};