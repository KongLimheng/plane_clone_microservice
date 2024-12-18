"use client";

import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { AppHeader, ContentWrapper } from "@/components/core";
import { ProfileSidebar } from "@/components/profile";
import { USER_PROFILE_PROJECT_SEGREGATION } from "@/constants/fetch-key";
import { PROFILE_ADMINS_TAB, PROFILE_VIEWER_TAB } from "@/constants/project";
import { useRouterParams, useUserPermissions } from "@/hooks/store";
import useSize from "@/hooks/use-window-size";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { UserService } from "@/services/user.service";
import { UserProfileHeader } from "./header";
import { ProfileNavbar } from "./navbar";

const userService = new UserService();

type Props = {
  children: React.ReactNode;
};

const UseProfileLayout = observer(({ children }: Props) => {
  // router
  const { workspaceSlug, userId } = useRouterParams();
  const pathname = usePathname();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  // derived values
  const isAuthorized = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const { windowWidth } = useSize();
  const isSmallerScreen = windowWidth >= 768;

  const { data: userProjectsData } = useSWR(
    workspaceSlug && userId ? USER_PROFILE_PROJECT_SEGREGATION(workspaceSlug, userId) : null,
    workspaceSlug && userId ? () => userService.getUserProfileProjectsSegregation(workspaceSlug, userId) : null
  );
  // derived values
  const isAuthorizedPath =
    pathname.includes("assigned") || pathname.includes("created") || pathname.includes("subscribed");
  const isIssuesTab = pathname.includes("assigned") || pathname.includes("created") || pathname.includes("subscribed");
  const tabsList = isAuthorized ? [...PROFILE_VIEWER_TAB, ...PROFILE_ADMINS_TAB] : PROFILE_VIEWER_TAB;
  const currentTab = tabsList.find((tab) => pathname === `/${workspaceSlug}/profile/${userId}${tab.selected}`);

  return (
    <>
      <div className="size-full flex flex-col md:flex-row overflow-hidden">
        <div className="size-full flex flex-col overflow-hidden">
          <AppHeader
            header={
              <UserProfileHeader
                userProjectsData={userProjectsData}
                type={currentTab?.label}
                showProfileIssuesFilter={isIssuesTab}
              />
            }
          />
          <ContentWrapper>
            <div className="size-full flex md:flex-col md:overflow-hidden">
              <div className="flex w-full flex-col md:h-full md:overflow-hidden">
                <ProfileNavbar tabsList={tabsList} />
                {isAuthorized || !isAuthorizedPath ? (
                  <div className={`w-full overflow-hidden h-full`}>{children}</div>
                ) : (
                  <div className="grid h-full w-full place-items-center text-custom-text-200">
                    You do not have the permission to access this page.
                  </div>
                )}
              </div>
              {!isSmallerScreen && <ProfileSidebar userProjectsData={userProjectsData} />}
            </div>
          </ContentWrapper>
        </div>
        {isSmallerScreen && <ProfileSidebar userProjectsData={userProjectsData} />}
      </div>
    </>
  );
});

export default UseProfileLayout;
