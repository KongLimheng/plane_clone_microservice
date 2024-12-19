"use client";

import { cn } from "@plane/utils";

type Props = {
  name: string;
  description: string;
  icon: JSX.Element;
  config: JSX.Element;
  disabled?: boolean;
  withBorder?: boolean;
  unavailable?: boolean;
};

export const AuthenticationMethodCard = ({
  name,
  description,
  icon,
  disabled = false,
  withBorder = true,
  unavailable = false,
  config,
}: Props) => (
  <div
    className={cn("w-full flex items-center gap-14 rounded", {
      "px-4 py-4 border border-custom-border-200": withBorder,
    })}
  >
    <div className={cn("flex grow items-center gap-4", { "opacity-50": unavailable })}>
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-custom-background-80">{icon}</div>
      </div>

      <div className="grow">
        <div className={cn("font-medium leading-5 text-custom-text-100", withBorder ? "text-sm" : "text-xl")}>
          {name}
        </div>
        <div className={cn("font-normal leading-5 text-custom-text-300")}>{description}</div>
      </div>
    </div>

    <div className={cn("shrink-0", { "opacity-70": disabled })}>{config}</div>
  </div>
);
