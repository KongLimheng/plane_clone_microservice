"use client";

import React, { PropsWithChildren } from "react";
import { AppHeader, ContentWrapper } from "@/components/core";
import { ProjectIssuesHeader } from "./header";

const ProjectIssuesLayout = ({ children }: PropsWithChildren) => (
  <>
    <AppHeader header={<ProjectIssuesHeader />} />
    <ContentWrapper>{children}</ContentWrapper>
  </>
);

export default ProjectIssuesLayout;
