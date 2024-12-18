"use client";

import { observer } from "mobx-react";
import { Briefcase, Circle, ExternalLink } from "lucide-react";
import { Breadcrumbs, Button, Header, LayersIcon, Logo, Tooltip } from "@plane/ui";
import { BreadcrumbLink, CountChip } from "@/components/common";
import { HeaderFilters } from "@/components/issues";
import { EIssuesStoreType } from "@/constants/issue";
import { SPACE_BASE_PATH, SPACE_BASE_URL } from "@/helpers/common.helper";
import { useCommandPalette, useRouterParams, useUserPermissions } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const ProjectIssuesHeader = observer(() => {
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = useRouterParams() as { workspaceSlug: string; projectId: string };
  // store hooks
  const { currentProjectDetails, loader } = useProject();
  // store hooks
  const {
    issues: { getGroupIssueCount },
  } = useIssues(EIssuesStoreType.PROJECT);

  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { isMobile } = usePlatformOS();

  const issuesCount = getGroupIssueCount(undefined, undefined, false);

  const SPACE_APP_URL = (SPACE_BASE_URL.trim() === "" ? window.location.origin : SPACE_BASE_URL) + SPACE_BASE_PATH;
  const publishedURL = `${SPACE_APP_URL}/issues/${currentProjectDetails?.anchor}`;
  const canUserCreateIssue = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  return (
    <Header>
      <Header.LeftItem>
        <div className="flex items-center gap-2.5">
          <Breadcrumbs onBack={() => router.back()} isLoading={loader}>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink
                  href={`/${workspaceSlug}/projects`}
                  label={currentProjectDetails?.name ?? "Project"}
                  icon={
                    currentProjectDetails ? (
                      currentProjectDetails && (
                        <span>
                          <Logo logo={currentProjectDetails.logo_props} size={16} />
                        </span>
                      )
                    ) : (
                      <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded uppercase">
                        <Briefcase className="h-4 w-4" />
                      </span>
                    )
                  }
                />
              }
            />
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={<BreadcrumbLink label="Issues" icon={<LayersIcon className="size-4 text-custom-text-300" />} />}
            />
          </Breadcrumbs>

          {issuesCount && issuesCount > 0 && (
            <Tooltip
              isMobile={isMobile}
              tooltipContent={`There are ${issuesCount} ${issuesCount > 1 ? "issues" : "issue"} in this project`}
              position="bottom"
            >
              <CountChip count={issuesCount} />
            </Tooltip>
          )}
        </div>
        {currentProjectDetails?.anchor && (
          <a
            href={publishedURL}
            className="group flex items-center gap-1.5 rounded bg-custom-primary-100/10 px-2.5 py-1 text-xs font-medium text-custom-primary-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Circle className="h-1.5 w-1.5 fill-custom-primary-100" strokeWidth={2} />
            Public
            <ExternalLink className="hidden h-3 w-3 group-hover:block" strokeWidth={2} />
          </a>
        )}
      </Header.LeftItem>

      <Header.RightItem>
        <div className="hidden gap-3 md:flex">
          <HeaderFilters
            projectId={projectId}
            currentProjectDetails={currentProjectDetails}
            canUserCreateIssue={canUserCreateIssue}
            workspaceSlug={workspaceSlug}
          />
        </div>

        {canUserCreateIssue && (
          <Button
            onClick={() => {
              toggleCreateIssueModal(true, EIssuesStoreType.PROJECT);
            }}
            size="sm"
          >
            <div className="hidden sm:block">Add</div> Issue
          </Button>
        )}
      </Header.RightItem>
    </Header>
  );
});
