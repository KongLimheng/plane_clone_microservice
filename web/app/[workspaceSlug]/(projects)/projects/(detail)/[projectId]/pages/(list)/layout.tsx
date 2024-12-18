"use client";

import { PropsWithChildren } from "react";
import { AppHeader, ContentWrapper } from "@/components/core";
import { PagesListHeader } from "./header";

export default function ProjectPagesListLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AppHeader header={<PagesListHeader />} />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
}
