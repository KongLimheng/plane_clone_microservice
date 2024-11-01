"use client";

import { cn } from "@plane/ui";
import { getFileURL } from "@/helpers/file.helper";

type Props = {
  logo: string | null | undefined;
  name: string | undefined;
  classNames?: string;
};

export const WorkspaceLogo = ({ logo, name, classNames = "" }: Props) => (
  <div
    className={cn(
      "relative grid h-6 w-6 shrink-0 place-items-center uppercase",
      { "rounded bg-custom-primary-500 text-white": !logo },
      classNames
    )}
  >
    {logo && logo !== "" ? (
      <img
        src={getFileURL(logo)}
        alt="Workspace logo"
        className="absolute left-0 top-0 h-full w-full rounded object-cover"
      />
    ) : (
      (name?.charAt(0) ?? "...")
    )}
  </div>
);
