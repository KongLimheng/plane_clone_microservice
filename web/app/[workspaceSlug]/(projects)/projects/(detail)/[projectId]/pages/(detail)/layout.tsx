"use client";

import React, { PropsWithChildren } from "react";
import { AppHeader, ContentWrapper } from "@/components/core";
import { PageDetailsHeader } from "./header";

const ProjectPageDetailsLayout = ({ children }: PropsWithChildren) => (
  <>
    <AppHeader header={<PageDetailsHeader />} />
    <ContentWrapper>{children}</ContentWrapper>
  </>
);

export default ProjectPageDetailsLayout;
