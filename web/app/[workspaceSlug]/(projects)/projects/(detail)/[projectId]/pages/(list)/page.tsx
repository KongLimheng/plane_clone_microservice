"use client";

import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import { TPageNavigationTabs } from "@plane/types";
import { PageHead } from "@/components/core";
import { EmptyState } from "@/components/empty-state";
import { PagesListRoot, PagesListView } from "@/components/pages";
import { EmptyStateType } from "@/constants/empty-state";
import { useRouterParams } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";

const ProjectPagesPage = observer(() => {
  // router
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const { workspaceSlug, projectId } = useRouterParams();
  // store hooks
  const { getProjectById, currentProjectDetails } = useProject();
  // derived values
  const project = projectId ? getProjectById(projectId.toString()) : undefined;
  const pageTitle = project?.name ? `${project?.name} - Pages` : undefined;
  const currentPageType = (): TPageNavigationTabs => {
    const pageType = type?.toString();
    if (pageType === "private") return "private";
    if (pageType === "archived") return "archived";
    return "public";
  };

  if (!workspaceSlug || !projectId) return <></>;

  if (currentProjectDetails?.page_view === false)
    return (
      <div>
        <EmptyState
          type={EmptyStateType.DISABLED_PROJECT_PAGE}
          primaryButtonLink={`/${workspaceSlug}/projects/${projectId}/settings/features`}
        />
      </div>
    );

  return (
    <>
      <PageHead title={pageTitle} />
      <PagesListView workspaceSlug={workspaceSlug} projectId={projectId} pageType={currentPageType()}>
        <PagesListRoot workspaceSlug={workspaceSlug} pageType={currentPageType()} projectId={projectId} />
      </PagesListView>
    </>
  );
});

export default ProjectPagesPage;
