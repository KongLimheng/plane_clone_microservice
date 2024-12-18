import { useCallback, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import {
  EditorRefApi,
  EditorReadOnlyRefApi,
  TRealtimeConfig,
  CollaborativeDocumentEditorWithRef,
  TDisplayConfig,
  TServerHandler,
} from "@plane/editor";
import { IUserLite } from "@plane/types";
import { Row } from "@plane/ui";
import { cn, LIVE_BASE_PATH, LIVE_BASE_URL } from "@/helpers/common.helper";
import { getEditorFileHandlers } from "@/helpers/editor.helper";
import { generateRandomColor } from "@/helpers/string.helper";
import { useUser, useWorkspace, useMention } from "@/hooks/store";
import { useMember } from "@/hooks/store/use-member";
import { usePageFilters } from "@/hooks/use-page-filter";
import { useEditorFlagging } from "@/plane-web/hooks/use-editor-flagging";
import { useFileSize } from "@/plane-web/hooks/use-file-size";
import { FileService } from "@/services/file.service";
import { IPage } from "@/store/pages/page";
import { PageContentLoader } from "../loaders";
import { PageEditorTitle } from "./title";

const fileService = new FileService();

type Props = {
  editorRef: React.RefObject<EditorRefApi>;
  editorReady: boolean;
  handleConnectionStatus: (status: boolean) => void;
  handleEditorReady: (value: boolean) => void;
  handleReadOnlyEditorReady: (value: boolean) => void;
  page: IPage;
  readOnlyEditorRef: React.RefObject<EditorReadOnlyRefApi>;
  sidePeekVisible: boolean;
};

export const PageEditorBody = observer(
  ({
    editorRef,
    handleConnectionStatus,
    handleEditorReady,
    handleReadOnlyEditorReady,
    page,
    readOnlyEditorRef,
    sidePeekVisible,
  }: Props) => {
    // router
    const { workspaceSlug, projectId } = useParams();
    // store hooks
    const { data: currentUser } = useUser();
    const { getWorkspaceBySlug } = useWorkspace();
    const {
      getUserDetails,
      project: { getProjectMemberIds },
    } = useMember();
    // derived values
    const workspaceId = workspaceSlug ? (getWorkspaceBySlug(workspaceSlug.toString())?.id ?? "") : "";
    const pageId = page?.id;
    const pageTitle = page?.name ?? "";
    const { isContentEditable, updateTitle } = page;
    const projectMemberIds = projectId ? getProjectMemberIds(projectId.toString()) : [];
    const projectMemberDetails = projectMemberIds?.map((id) => getUserDetails(id) as IUserLite);
    // use-mention
    const { mentionHighlights, mentionSuggestions } = useMention({
      workspaceSlug: workspaceSlug?.toString() ?? "",
      projectId: projectId?.toString() ?? "",
      members: projectMemberDetails,
      user: currentUser ?? undefined,
    });

    // editor flaggings
    const { documentEditor } = useEditorFlagging();
    // page filters
    const { fontSize, fontStyle, isFullWidth } = usePageFilters();
    const { maxFileSize } = useFileSize();
    const displayConfig: TDisplayConfig = {
      fontSize,
      fontStyle,
    };

    const handleServerConnect = useCallback(() => {
      handleConnectionStatus(false);
    }, []);

    const handleServerError = useCallback(() => {
      handleConnectionStatus(true);
    }, []);

    const serverHandler: TServerHandler = useMemo(
      () => ({
        onConnect: handleServerConnect,
        onServerError: handleServerError,
      }),
      []
    );

    const realtimeConfig: TRealtimeConfig | undefined = useMemo(() => {
      // Construct the WebSocket Collaboration URL
      try {
        const LIVE_SERVER_BASE_URL = LIVE_BASE_URL?.trim() || window.location.origin;
        const WS_LIVE_URL = new URL(LIVE_SERVER_BASE_URL);
        const isSecureEnvironment = window.location.protocol === "https:";
        WS_LIVE_URL.protocol = isSecureEnvironment ? "wss" : "ws";
        WS_LIVE_URL.pathname = `${LIVE_BASE_PATH}/collaboration`;
        // Construct realtime config
        return {
          url: WS_LIVE_URL.toString(),
          queryParams: {
            workspaceSlug: workspaceSlug?.toString(),
            projectId: projectId?.toString(),
            documentType: "project_page",
          },
        };
      } catch (error) {
        console.error("Error creating realtime config", error);
        return undefined;
      }
    }, [projectId, workspaceSlug]);

    const userConfig = useMemo(
      () => ({
        id: currentUser?.id ?? "",
        name: currentUser?.display_name ?? "",
        color: generateRandomColor(currentUser?.id ?? ""),
      }),
      [currentUser]
    );
    if (pageId === undefined || !realtimeConfig) return <PageContentLoader />;

    return (
      <div className="flex items-center size-full overflow-y-auto">
        <Row>{!isFullWidth && <div>full width</div>}</Row>

        <div
          className={cn("size-full pt-5 duration-200", {
            "md:w-[calc(100%-10rem)] xl:w-[calc(100%-28rem)]": !isFullWidth,
            "md:w-[90%]": isFullWidth,
          })}
        >
          <div className="size-full flex flex-col gap-y-7 overflow-y-auto overflow-x-hidden">
            <div className="relative w-full flex-shrink-0 md:pl-5 px-4">
              <PageEditorTitle
                editorRef={editorRef}
                title={pageTitle}
                readOnly={!isContentEditable}
                updateTitle={updateTitle}
              />
            </div>

            {isContentEditable ? (
              <CollaborativeDocumentEditorWithRef
                id={pageId}
                fileHandler={getEditorFileHandlers({
                  maxFileSize,
                  projectId: projectId.toString() ?? "",
                  uploadFile: async (file) => {
                    // const {} = await fileService.uppr
                  },
                  workspaceId,
                  workspaceSlug: workspaceSlug.toString() ?? "",
                })}
                handleEditorReady={handleEditorReady}
                ref={editorRef}
                containerClassName="h-full p-0 pb-64"
                displayConfig={displayConfig}
                editorClassName="pl-10"
                mentionHandler={{ highlights: mentionHighlights, suggestions: mentionSuggestions }}
                // embedHandler={{issue: issem}}

                realtimeConfig={realtimeConfig}
                serverHandler={serverHandler}
                user={userConfig}
                disabledExtensions={documentEditor}
                // aiHandler={{menu: getAi}}
              />
            ) : (
              <div>Not Editable</div>
            )}
          </div>
        </div>

        <div
          className={cn("hidden xl:block flex-shrink-0 duration-200", {
            "w-[10rem] lg:w-[14rem]": !isFullWidth,
            "w-[5%]": isFullWidth,
          })}
        />
      </div>
    );
  }
);
