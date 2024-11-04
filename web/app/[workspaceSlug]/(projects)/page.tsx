"use client";

import { observer } from "mobx-react";
import { PageHead } from "@/components/core";
import { AppHeader } from "@/components/core/app-header";
import { WorkspaceDashboardView } from "@/components/page-views";
import { useWorkspace } from "@/hooks/store";
import { ContentWrapper } from "./content-wrapper";
import { WorkspaceDashboardHeader } from "./header";

const WorkspaceDashboardPage = observer(() => {
  const { currentWorkspace } = useWorkspace();

  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Home` : undefined;
  return (
    <>
      <AppHeader header={<WorkspaceDashboardHeader />} />
      <ContentWrapper>
        <PageHead title={pageTitle} />
        <WorkspaceDashboardView />
      </ContentWrapper>
    </>
  );
});

export default WorkspaceDashboardPage;
