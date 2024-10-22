"use client";
import { observer } from "mobx-react";
import { Menu } from "lucide-react";
import { useTheme } from "@/hooks/store";

export const SidebarHamburgerToggle = observer(() => {
  const { isSidebarCollapsed, toggleSidebar } = useTheme();
  return (
    <div
      onClick={() => toggleSidebar(!isSidebarCollapsed)}
      className="w-7 h-7 rounded flex justify-center items-center bg-custom-background-80 transition-all hover:bg-custom-background-90 cursor-pointer group md:hidden"
    >
      <Menu size={14} className="text-custom-text-200 group-hover:text-custom-text-100 transition-all" />
    </div>
  );
});
