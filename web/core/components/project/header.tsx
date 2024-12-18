"use client";

import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { Briefcase, Search, X } from "lucide-react";
import { useOutsideClickDetector } from "@plane/helpers";
import { Breadcrumbs, Button, Header } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { useCommandPalette, useUserPermissions } from "@/hooks/store";
import { useProjectFilter } from "@/hooks/store/use-project-filter";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { BreadcrumbLink } from "../common";
import HeaderFilters from "./filters";

export const ProjectsBaseHeader = observer(() => {
  // states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // refs
  const inputRef = useRef<HTMLInputElement>(null);
  // store hooks
  const { toggleCreateProjectModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();

  const pathname = usePathname();

  const { searchQuery, updateSearchQuery } = useProjectFilter();
  // auth
  const isAuthorizedUser = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  const isArchived = pathname.includes("/archives");

  // outside click detector hook
  useOutsideClickDetector(inputRef, () => {
    if (isSearchOpen && searchQuery.trim() === "") setIsSearchOpen(false);
  });

  useEffect(() => {
    if (searchQuery.trim() !== "") setIsSearchOpen(true);
  }, [searchQuery]);

  return (
    <Header>
      <Header.LeftItem>
        <Breadcrumbs>
          <Breadcrumbs.BreadcrumbItem
            type="text"
            link={<BreadcrumbLink label="Projects" icon={<Briefcase className="size-4 text-custom-text-300" />} />}
          />

          {isArchived && <Breadcrumbs.BreadcrumbItem type="text" link={<BreadcrumbLink label="Archived" />} />}
        </Breadcrumbs>
      </Header.LeftItem>

      <Header.RightItem>
        <div className="flex items-center">
          {!isSearchOpen && (
            <button
              type="button"
              className="-mr-1 p-2 hover:bg-custom-background-80 rounded text-custom-text-400 place-items-center grid"
              onClick={() => {
                setIsSearchOpen(true);
                inputRef.current?.focus();
              }}
            >
              <Search className="size-3.5" />
            </button>
          )}
          <div
            className={cn(
              "ml-auto flex items-center justify-start gap-1 rounded-md border border-transparent bg-custom-background-100 text-custom-text-400 w-0 transition-[width] ease-linear overflow-hidden opacity-0",
              {
                "w-30 md:w-64 px-2.5 py-1.5 border-custom-border-200 opacity-100": isSearchOpen,
              }
            )}
          >
            <Search className="size-3.5" />
            <input
              type="text"
              ref={inputRef}
              className="w-full max-w-[234px] border-none bg-transparent text-sm text-custom-text-100 placeholder:text-custom-text-400 focus:outline-none"
              placeholder="Search"
            />

            {isSearchOpen && (
              <button
                type="button"
                className="grid place-items-center"
                onClick={() => {
                  updateSearchQuery("");
                  setIsSearchOpen(false);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex">
          <HeaderFilters />
        </div>

        {isAuthorizedUser && !isArchived && (
          <Button
            className="items-center gap-1"
            size="sm"
            onClick={() => {
              toggleCreateProjectModal(true);
            }}
          >
            <span className="hidden sm:inline-block">Add</span> Project
          </Button>
        )}
      </Header.RightItem>
    </Header>
  );
});
