"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { TPage } from "@plane/types";
import { Breadcrumbs, Button, Header, Logo, setToast, TOAST_TYPE } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common";
import { EPageAccess } from "@/constants/page";
import { useRouterParams, useUserPermissions } from "@/hooks/store";
import { useProjectPages } from "@/hooks/store/pages";
import { useProject } from "@/hooks/store/use-project";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const PagesListHeader = observer(() => {
  // states
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug } = useRouterParams();
  const searchParams = useSearchParams();
  const pageType = searchParams.get("type");
  // store hooks
  const { allowPermissions } = useUserPermissions();

  const { currentProjectDetails, loader } = useProject();
  const { createPage } = useProjectPages();
  // const { setTrackElement } = useEventTracker();

  // auth
  const canUserCreatePage = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    EUserPermissionsLevel.PROJECT
  );
  // handle page create
  const handleCreatePage = async () => {
    setIsCreatingPage(true);

    const payload: Partial<TPage> = {
      access: pageType === "private" ? EPageAccess.PRIVATE : EPageAccess.PUBLIC,
    };

    createPage(payload)
      .then((res) => {
        const pageId = `/${workspaceSlug}/projects/${currentProjectDetails?.id}/pages/${res?.id}`;
        router.push(pageId);
      })
      .catch((err) =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.data?.error || "Page could not be created. Please try again.",
        })
      )
      .finally(() => setIsCreatingPage(false));
  };

  return (
    <Header>
      <Header.LeftItem>
        <div>
          <Breadcrumbs isLoading={loader}>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink
                  label={currentProjectDetails?.name ?? "Project"}
                  icon={
                    currentProjectDetails && (
                      <span className="grid size-4 flex-shrink-0 place-items-center">
                        <Logo logo={currentProjectDetails.logo_props} size={16} />
                      </span>
                    )
                  }
                />
              }
            />

            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={<BreadcrumbLink label="Pages" icon={<FileText className="size-4 text-custom-text-300" />} />}
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
      {canUserCreatePage && (
        <Header.RightItem>
          <Button variant="primary" size="sm" onClick={handleCreatePage} loading={isCreatingPage}>
            {isCreatingPage ? "Adding" : "Add page"}
          </Button>
        </Header.RightItem>
      )}
    </Header>
  );
});
