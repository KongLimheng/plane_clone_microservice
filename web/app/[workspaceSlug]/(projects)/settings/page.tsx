"use client";

import React from "react";
import { observer } from "mobx-react";
import { PageHead } from "@/components/core";
import { WorkspaceDetails } from "@/components/workspace/settings/workspace-details";
import { useWorkspace } from "@/hooks/store";

const WorkspaceSettingPage = observer(() => {
  // store hooks
  const { currentWorkspace } = useWorkspace();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - General Settings` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <WorkspaceDetails />
    </>
  );
});

export default WorkspaceSettingPage;
