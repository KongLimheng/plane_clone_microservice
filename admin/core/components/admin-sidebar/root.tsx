"use client";

import { FC, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useOutsideClickDetector } from "@plane/helpers";
import { cn } from "@plane/utils";
import { useTheme } from "@/hooks/store";
import { HelpSection } from "./help-section";
import { SidebarDropdown } from "./sidebar-dropdown";
import { SidebarMenu } from "./sidebar-menu";

export const InstanceSidebar: FC = observer(() => {
  const { isSidebarCollapsed, toggleSidebar } = useTheme();

  const ref = useRef<HTMLDivElement>(null);
  useOutsideClickDetector(ref, () => {
    if (isSidebarCollapsed === false) {
      if (window.innerWidth < 768) {
        toggleSidebar(!isSidebarCollapsed);
      }
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        toggleSidebar(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toggleSidebar]);

  return (
    <div
      className={cn(
        "inset-y-0 z-20 flex h-full flex-shrink-0 flex-col border-r border-custom-sidebar-border-200 bg-custom-sidebar-background-100 duration-300 fixed md:relative",
        { "-ml-[290px]": isSidebarCollapsed },
        `sm:${isSidebarCollapsed ? "-ml-[290px]" : ""}`,
        `md:ml-0 ${isSidebarCollapsed ? "w-[70px]" : "w-[290px]"}`,
        `lg:ml-0 ${isSidebarCollapsed ? "w-[70px]" : "w-[290px]"}`
      )}
    >
      <div ref={ref} className="flex h-full w-full flex-1 flex-col">
        <SidebarDropdown />
        <SidebarMenu />
        <HelpSection />
      </div>
    </div>
  );
});
