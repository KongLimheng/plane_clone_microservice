"use client";

import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { BreadcrumbItem, BreadCrumbs } from "@plane/ui";
import { SidebarHamburgerToggle } from "./admin-sidebar";
import { BreadcrumbLink } from "./common";

export const InstanceHeader = observer(() => {
  const pathName = usePathname();
  const getHeaderTitle = (pathName: string) => {
    switch (pathName) {
      case "general":
        return "General";
      case "ai":
        return "Artificial Intelligence";
      case "email":
        return "Email";
      case "authentication":
        return "Authentication";
      case "image":
        return "Image";
      case "google":
        return "Google";
      case "github":
        return "Github";
      case "gitlab":
        return "GitLab";
      default:
        return pathName.toUpperCase();
    }
  };

  // Function to dynamically generate breadcrumb items based on pathname
  const generateBreadcrumbItems = (pathname: string) => {
    const pathSegments = pathname.split("/").slice(1); // removing the first empty string.
    pathSegments.pop();

    let currentUrl = "";
    const breadcrumbItems = pathSegments.map((segment) => {
      currentUrl += "/" + segment;
      return {
        title: getHeaderTitle(segment),
        href: currentUrl,
      };
    });
    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumbItems(pathName);

  return (
    <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 items-center justify-between gap-x-2 gap-y-4 border-b border-custom-sidebar-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
        <SidebarHamburgerToggle />
        {breadcrumbItems.length >= 0 && (
          <div>
            <BreadCrumbs>
              <BreadcrumbItem
                type="text"
                link={
                  <BreadcrumbLink
                    href="/general/"
                    label="Settings"
                    icon={<Settings className="h-4 w-4 text-custom-text-300" />}
                  />
                }
              />
              {breadcrumbItems.map(
                ({ title, href }) =>
                  title && (
                    <BreadcrumbItem key={title} type="text" link={<BreadcrumbLink href={href} label={title} />} />
                  )
              )}
            </BreadCrumbs>
          </div>
        )}
      </div>
    </div>
  );
});
