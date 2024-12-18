import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import { EditorRefApi, EditorReadOnlyRefApi } from "@plane/editor";
import { TPage } from "@plane/types";
import { useProjectPages } from "@/hooks/store/pages";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePageFallback } from "@/hooks/use-page-fallback";
import { useQueryParams } from "@/hooks/use-query-params";
import { ProjectPageService } from "@/services/page";
import { IPage } from "@/store/pages/page";
import { PageEditorBody } from "./editor-body";
import { PageEditorHeaderRoot } from "./header";

type TPageRootProps = {
  page: IPage;
  projectId: string;
  workspaceSlug: string;
};

const projectPageService = new ProjectPageService();
export const PageRoot = observer((props: TPageRootProps) => {
  const { projectId, workspaceSlug, page } = props;
  // states
  const [editorReady, setEditorReady] = useState(false);
  const [hasConnectionFailed, setHasConnectionFailed] = useState(false);
  const [readOnlyEditorReady, setReadOnlyEditorReady] = useState(false);
  const [sidePeekVisible, setSidePeekVisible] = useState(window.innerWidth >= 768);
  const [isVersionsOverlayOpen, setIsVersionsOverlayOpen] = useState(false);
  // refs
  const editorRef = useRef<EditorRefApi>(null);
  const readOnlyEditorRef = useRef<EditorReadOnlyRefApi>(null);
  // router
  const router = useAppRouter();
  // search params
  const searchParams = useSearchParams();

  // store hooks
  const { createPage } = useProjectPages();
  // derived values
  const { access, description_html, name, updateDescription } = page;
  const handleDuplicatePage = async () => {};

  usePageFallback({
    editorRef,
    fetchPageDescription: async () => {
      if (!page.id) return;
      return await projectPageService.fetchDescriptionBinary(workspaceSlug, projectId, page.id);
    },
    hasConnectionFailed,
    updatePageDescription: async (data) => await updateDescription(data),
  });

  // update query params
  const { updateQueryParams } = useQueryParams();
  const handleCreatePage = async (payload: Partial<TPage>) => await createPage(payload);

  const version = searchParams.get("version");
  useEffect(() => {
    if (!version) {
      setIsVersionsOverlayOpen(false);
    } else {
      setIsVersionsOverlayOpen(true);
    }
  }, [version]);
  return (
    <>
      <PageEditorHeaderRoot
        editorReady={editorReady}
        editorRef={editorRef}
        handleDuplicatePage={handleDuplicatePage}
        page={page}
        readOnlyEditorReady={readOnlyEditorReady}
        readOnlyEditorRef={readOnlyEditorRef}
        setSidePeekVisible={(state) => setSidePeekVisible(state)}
        sidePeekVisible={sidePeekVisible}
      />

      <PageEditorBody
        editorReady={editorReady}
        editorRef={editorRef}
        handleConnectionStatus={(status) => setHasConnectionFailed(status)}
        handleEditorReady={(val) => setEditorReady(val)}
        handleReadOnlyEditorReady={() => setReadOnlyEditorReady(true)}
        page={page}
        readOnlyEditorRef={readOnlyEditorRef}
        sidePeekVisible={sidePeekVisible}
      />
    </>
  );
});
