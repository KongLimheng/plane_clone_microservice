"use client";

import React from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getButtonStyling } from "@plane/ui";
import { LogoSpinner } from "@/components/common";
import { PageHead } from "@/components/core";
import { PageRoot } from "@/components/pages/editor";
import { cn } from "@/helpers/common.helper";
import { useRouterParams } from "@/hooks/store";
import { usePage, useProjectPages } from "@/hooks/store/pages";

const PageDetailsPage = observer(() => {
  const { workspaceSlug, projectId, pageId } = useParams();

  // store hooks
  const { getPageById } = useProjectPages();

  const page = usePage(pageId?.toString() ?? "");
  const { id, name } = page;

  // fetch page details
  const { error: pageDetailsError } = useSWR(
    workspaceSlug && projectId && pageId ? `PAGE_DETAILS_${pageId}` : null,
    workspaceSlug && projectId && pageId
      ? () => getPageById(workspaceSlug?.toString(), projectId?.toString(), pageId.toString())
      : null,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if ((!page || !id) && !pageDetailsError)
    return (
      <div className="size-full grid place-items-center">
        <LogoSpinner />
      </div>
    );

  if (pageDetailsError)
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-center">Page not found</h3>
        <p className="text-sm text-custom-text-200 text-center mt-3">
          The page you are trying to access doesn{"'"}t exist or you don{"'"}t have permission to view it.
        </p>
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/pages`}
          className={cn(getButtonStyling("neutral-primary", "md"), "mt-5")}
        >
          View other Pages
        </Link>
      </div>
    );
  return (
    <>
      <PageHead title={name} />
      <div className="flex h-full flex-col justify-between">
        <div className="relative size-full flex-shrink-0 flex flex-col overflow-hidden">
          <PageRoot page={page} projectId={projectId.toString()} workspaceSlug={workspaceSlug.toString()} />
        </div>
      </div>
    </>
  );
});

export default PageDetailsPage;
