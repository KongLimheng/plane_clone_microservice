"use client";

import { ReactNode } from "react";
import { ContentWrapper } from "@/components/core";
import { AppHeader } from "@/components/core/app-header";
import { ProjectsListHeader } from "@/plane-web/components/projects/header";

export default function ProjectListLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader header={<ProjectsListHeader />} />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
}
