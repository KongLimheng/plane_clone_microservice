"use client";

import React from "react";
import { observer } from "mobx-react";
import Head from "next/head";
import { PageHead } from "@/components/core";
import { ProjectLayoutRoot } from "@/components/issues";
import { useRouterParams } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";

const ProjectIssuesPage = observer(() => {
  const { projectId } = useRouterParams();
  // store
  const { getProjectById } = useProject();

  if (!projectId) {
    return <></>;
  }
  // derived values
  const project = getProjectById(projectId.toString());
  const pageTitle = project?.name ? `${project?.name} - Issues` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <Head>
        <title>{project?.name} - Issues</title>
      </Head>
      <div className="size-full">
        <ProjectLayoutRoot />
      </div>
    </>
  );
});

export default ProjectIssuesPage;
