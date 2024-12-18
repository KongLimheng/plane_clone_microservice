import { observer } from "mobx-react";
import { TPageNavigationTabs } from "@plane/types";
import { ListLayout } from "@/components/core";
import { useProjectPages } from "@/hooks/store/pages";
import { PageListBlock } from "./block";

type TPagesListRoot = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const PagesListRoot = observer(({ pageType, projectId, workspaceSlug }: TPagesListRoot) => {
  // store hooks
  const { getCurrentProjectFilteredPageIds } = useProjectPages();
  // derived values
  const filteredPageIds = getCurrentProjectFilteredPageIds(pageType);

  if (!filteredPageIds) return <></>;
  return (
    <ListLayout>
      {filteredPageIds.map((pageId) => (
        <PageListBlock key={pageId} workspaceSlug={workspaceSlug} projectId={projectId} pageId={pageId} />
      ))}
    </ListLayout>
  );
});
