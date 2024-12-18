"use client";

import { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Disclosure, Transition } from "@headlessui/react";
import { useOutsideClickDetector } from "@plane/helpers";
import { IUserProfileProjectSegregation } from "@plane/types";
import { Avatar, Loader, Logo, Tooltip } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { renderFormattedDate } from "@/helpers/date-time.helper";
import { getFileURL } from "@/helpers/file.helper";
import { useAppTheme, useRouterParams, useUser } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { ProfileSidebarTime } from "./time";

type TProfileSidebar = {
  userProjectsData: IUserProfileProjectSegregation | undefined;
  className?: string;
};

export const ProfileSidebar = observer(({ userProjectsData, className = "" }: TProfileSidebar) => {
  // refs
  const ref = useRef<HTMLDivElement>(null);
  // router
  const { userId } = useRouterParams();
  // store hooks
  const { data: currentUser } = useUser();
  const { profileSidebarCollapsed, toggleProfileSidebar } = useAppTheme();
  const { getProjectById } = useProject();
  const { isMobile } = usePlatformOS();
  // derived values
  const userData = userProjectsData?.user_data;
  const userDetails = [
    {
      label: "Joined on",
      value: renderFormattedDate(userData?.date_joined ?? ""),
    },
    {
      label: "Timezone",
      value: <ProfileSidebarTime timeZone={userData?.user_timezone} />,
    },
  ];

  useOutsideClickDetector(ref, () => {
    if (profileSidebarCollapsed === false) {
      if (window.innerWidth < 768) {
        toggleProfileSidebar();
      }
    }
  });

  useEffect(() => {
    const handleToggleProfileSidebar = () => {
      if (window && window.innerWidth < 768) {
        toggleProfileSidebar(true);
      }
      if (window && profileSidebarCollapsed && window.innerWidth >= 768) {
        toggleProfileSidebar(false);
      }
    };

    window.addEventListener("resize", handleToggleProfileSidebar);
    handleToggleProfileSidebar();
    return () => window.removeEventListener("resize", handleToggleProfileSidebar);
  }, []);

  return (
    <div
      className={cn(
        "vertical-scrollbar scrollbar-md fixed z-[5] h-full w-full flex-shrink-0 overflow-hidden overflow-y-auto border-l border-custom-border-100 bg-custom-sidebar-background-100 transition-all md:relative md:w-[300px]",
        className
      )}
      style={profileSidebarCollapsed ? { marginLeft: `${window?.innerWidth || 0}px` } : {}}
    >
      {userProjectsData ? (
        <>
          <div className="relative h-[110px]">
            {currentUser?.id === userId && (
              <div className="absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded bg-white">
                <Link href="/profile">
                  <span className="grid place-items-center text-black">
                    <Pencil className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            )}

            <img
              src={
                userData?.cover_image_url
                  ? getFileURL(userData.cover_image_url)
                  : "/users/user-profile-cover-default-img.png"
              }
              alt={userData?.display_name}
              className="size-full object-cover"
            />

            <div className="absolute -bottom-[26px] left-5 h-[52px] w-[52px] rounded">
              {userData?.avatar_url && userData?.avatar_url !== "" ? (
                <img
                  src={getFileURL(userData?.avatar_url)}
                  alt={userData?.display_name}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded bg-custom-background-90 capitalize text-custom-text-100">
                  {userData?.first_name?.[0]}
                </div>
              )}
            </div>
          </div>

          <div className="px-5">
            <div className="mt-[38px]">
              <h4 className="text-lg font-semibold">
                {userData?.first_name} {userData?.last_name}
              </h4>
              <h6 className="text-sm text-custom-text-200">({userData?.display_name})</h6>
            </div>

            <div className="mt-6 space-y-5">
              {userDetails.map((detail) => (
                <div key={detail.label} className="flex items-center gap-4 text-sm">
                  <div className="w-2/5 flex-shrink-0 text-custom-text-200">{detail.label}</div>
                  <div className="w-3/5 break-words font-medium">{detail.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-9 divide-y divide-custom-border-100">
              {userProjectsData.project_data.map((project, idx) => {
                const projectDetails = getProjectById(project.id);
                const totalIssues =
                  project.created_issues + project.assigned_issues + project.pending_issues + project.completed_issues;

                const completedIssuePercentage =
                  project.assigned_issues === 0
                    ? 0
                    : Math.round((project.completed_issues / project.assigned_issues) * 100);

                if (!projectDetails) return null;

                return (
                  <Disclosure key={project.id} as={"div"} className={`${idx === 0 ? "pb-3" : "py-3"}`}>
                    {({ open }) => (
                      <div className="w-full">
                        <Disclosure.Button className={"flex w-full items-center justify-between gap-2"}>
                          <div className="flex w-3/4 items-center gap-2">
                            <span className="grid size-7 flex-shrink-0 place-items-center">
                              <Logo logo={projectDetails.logo_props} />
                            </span>
                            <div className="truncate break-words text-sm font-medium">{projectDetails.name}</div>
                          </div>
                          <div>
                            {project.assigned_issues > 0 && (
                              <Tooltip tooltipContent="Completion percentage" position="left" isMobile={isMobile}>
                                <div
                                  className={`rounded px-1 py-0.5 text-xs font-medium ${
                                    completedIssuePercentage <= 35
                                      ? "bg-red-500/10 text-red-500"
                                      : completedIssuePercentage <= 70
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : "bg-green-500/10 text-green-500"
                                  }`}
                                >
                                  {completedIssuePercentage}%
                                </div>
                              </Tooltip>
                            )}
                            <ChevronRight className={cn("size-4 transition-all", { "rotate-90": open })} />
                          </div>
                        </Disclosure.Button>

                        <Transition
                          show={open}
                          enter="transition duration-100 ease-out"
                          enterFrom="transform opacity-0"
                          enterTo="transform opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform opacity-100"
                          leaveTo="transform opacity-0"
                        >
                          <Disclosure.Panel className={"mt-5 pl-9"}>
                            {totalIssues > 0 && <div>hi</div>}

                            <div className="mt-7 space-y-5 text-sm text-custom-text-200">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#203b80]" />
                                  Created
                                </div>
                                <div className="font-medium">{project.created_issues} Issues</div>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#3f76ff]" />
                                  Assigned
                                </div>
                                <div className="font-medium">{project.assigned_issues} Issues</div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
                                  Due
                                </div>
                                <div className="font-medium">{project.pending_issues} Issues</div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />
                                  Completed
                                </div>
                                <div className="font-medium">{project.completed_issues} Issues</div>
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Loader className="space-y-7 px-5">
          <Loader.Item height="130px" />
          <div className="space-y-5">
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
          </div>
        </Loader>
      )}
    </div>
  );
});
