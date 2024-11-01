"use client";

import { useTheme } from "next-themes";
import { Home } from "lucide-react";
import { BreadcrumbItem, Breadcrumbs, Header } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common";
import Image from "next/image";
// images
import githubBlackImage from "/public/logos/github-black.png";
import githubWhiteImage from "/public/logos/github-white.png";

export const WorkspaceDashboardHeader = () => {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Header>
        <Header.LeftItem>
          <div>
            <Breadcrumbs>
              <BreadcrumbItem
                type="text"
                link={<BreadcrumbLink label="Home" icon={<Home className="size-4 text-custom-text-300" />} />}
              />
            </Breadcrumbs>
          </div>
        </Header.LeftItem>

        <Header.RightItem>
          <a
            className="flex flex-shrink-0 items-center gap-1.5 rounded bg-custom-background-80 px-3 py-1.5"
            href="https://github.com/makeplane/plane"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={resolvedTheme === "dark" ? githubWhiteImage : githubBlackImage}
              height={16}
              width={16}
              alt="GitHub Logo"
            />
            <span className="hidden text-xs font-medium sm:hidden md:block">Star us on GitHub</span>
          </a>
        </Header.RightItem>
      </Header>
    </>
  );
};
