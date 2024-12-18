import { observer } from "mobx-react";
import useSWR from "swr";
import { TPageNavigationTabs } from "@plane/types";
import { useProjectPages } from "@/hooks/store/pages";
import { PagesListHeaderRoot } from "./header";
import { PagesListMainContent } from "./pages-list-main-content";

type TPageView = {
  workspaceSlug: string;
  projectId: string;
  pageType: TPageNavigationTabs;
  children: React.ReactNode;
};

export const PagesListView = observer(({ workspaceSlug, projectId, pageType, children }: TPageView) => {
  // store hooks
  const { getAllPages, isAnyPageAvailable } = useProjectPages();

  // fetching pages list
  useSWR(
    workspaceSlug && projectId && pageType ? `PROJECT_PAGES_${projectId}` : null,
    workspaceSlug && projectId && pageType ? () => getAllPages(workspaceSlug, projectId, pageType) : null
  );

  return (
    <div className="relative size-full overflow-hidden flex flex-col">
      {/* tab header */}
      {isAnyPageAvailable && (
        <PagesListHeaderRoot pageType={pageType} projectId={projectId} workspaceSlug={workspaceSlug} />
      )}
      <PagesListMainContent pageType={pageType}>{children}</PagesListMainContent>
    </div>
  );
});
