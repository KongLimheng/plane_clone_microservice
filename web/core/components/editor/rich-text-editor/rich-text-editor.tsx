import { forwardRef } from "react";
import { EditorRefApi, IRichTextEditor, RichTextEditorWithRef } from "@plane/editor";
import { IUserLite } from "@plane/types";
import { cn } from "@/helpers/common.helper";
import { getEditorFileHandlers } from "@/helpers/editor.helper";
import { useMention, useUser } from "@/hooks/store";
import { useMember } from "@/hooks/store/use-member";
import { useFileSize } from "@/plane-web/hooks/use-file-size";

interface RichTextEditorWrapperProps extends Omit<IRichTextEditor, "fileHandler" | "mentionHandler"> {
  workspaceSlug: string;
  workspaceId: string;
  projectId: string;
  uploadFile: (file: File) => Promise<string>;
}

export const RichTextEditor = forwardRef<EditorRefApi, RichTextEditorWrapperProps>((props, ref) => {
  const { containerClassName, workspaceSlug, workspaceId, projectId, uploadFile, ...rest } = props;

  // store hooks
  const { data: currentUser } = useUser();
  const {
    getUserDetails,
    project: { getProjectMemberIds },
  } = useMember();
  // derived values
  const projectMemberIds = getProjectMemberIds(projectId);

  const projectMemberDetails = projectMemberIds?.map((id) => getUserDetails(id) as IUserLite);

  // file size
  const { maxFileSize } = useFileSize();
  // use-mention
  const { mentionHighlights, mentionSuggestions } = useMention({
    workspaceSlug,
    projectId,
    members: projectMemberDetails,
    user: currentUser,
  });

  return (
    <RichTextEditorWithRef
      ref={ref}
      fileHandler={getEditorFileHandlers({
        maxFileSize,
        projectId,
        uploadFile,
        workspaceId,
        workspaceSlug,
      })}
      mentionHandler={{
        highlights: mentionHighlights,
        suggestions: mentionSuggestions,
      }}
      containerClassName={cn("relative pl-3", containerClassName)}
      {...rest}
    />
  );
});

RichTextEditor.displayName = "RichTextEditor";
