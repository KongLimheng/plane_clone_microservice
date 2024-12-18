"use client";

import { useEffect } from "react";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { calculateTotalFilters } from "@/helpers/filter.helper";
import { useRouterParams, useWorkspace } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { useProjectFilter } from "@/hooks/store/use-project-filter";
import { PageHead } from "../core";
import { ProjectCardList } from "./card-list";

const Root = observer(() => {
  const { currentWorkspace } = useWorkspace();
  const { workspaceSlug } = useRouterParams();
  const pathname = usePathname();

  // store
  const { totalProjectIds, filteredProjectIds } = useProject();
  const {
    currentWorkspaceFilters,
    currentWorkspaceAppliedDisplayFilters,
    clearAllFilters,
    clearAllAppliedDisplayFilters,
    updateFilters,
    updateDisplayFilters,
  } = useProjectFilter();
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Projects` : undefined;

  const isArchived = pathname.includes("/archives");
  const allowedDisplayFilters =
    currentWorkspaceAppliedDisplayFilters?.filter((filter) => filter !== "archived_projects") ?? [];

  useEffect(() => {
    if (isArchived) {
      updateDisplayFilters(workspaceSlug!, { archived_projects: true });
    } else {
      updateDisplayFilters(workspaceSlug!, { archived_projects: false });
    }
  }, [isArchived, updateDisplayFilters, workspaceSlug]);

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="flex size-full flex-col">
        <ProjectCardList />
      </div>
    </>
  );
});

export default Root;
