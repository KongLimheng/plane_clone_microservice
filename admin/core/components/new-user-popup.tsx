"use client";

import { observer } from "mobx-react";
import { useTheme as nextUseTheme } from "next-themes";

import { Button, getButtonStyling } from "@plane/ui";
import { resolveGeneralTheme, WEB_BASE_URL } from "@/helpers/common.helper";
import { useTheme } from "@/hooks/store";
import Image from "next/image";
// icons
import TakeoffIconLight from "/public/logos/takeoff-icon-light.svg";
import TakeoffIconDark from "/public/logos/takeoff-icon-dark.svg";

export const NewUserPopup = observer(() => {
  // hooks
  const { isNewUserPopup, toggleNewUserPopup } = useTheme();
  // theme
  const { resolvedTheme } = nextUseTheme();
  const redirectionLink = encodeURI(WEB_BASE_URL + "/create-workspace");
  if (!isNewUserPopup) return <></>;

  return (
    <div className="absolute bottom-8 right-8 p-6 w-96 border-custom-border-100 border shadow-md rounded-lg bg-custom-background-100">
      <div className="flex gap-4">
        <div className="grow">
          <div className="text-base font-semibold">Create workspace</div>
          <div className="py-2 text-sm font-medium text-custom-text-300">
            Instance setup done! Welcome to Plane instance portal. Start your journey with by creating your first
            workspace, you will need to login again.
          </div>

          <div className="flex items-center gap-4 pt-2">
            <a href={redirectionLink} className={getButtonStyling("primary", "sm")}>
              Create workspace
            </a>

            <Button variant="neutral-primary" size="sm" onClick={toggleNewUserPopup}>
              Close
            </Button>
          </div>
        </div>

        <div>
          <Image
            src={resolveGeneralTheme(resolvedTheme) === "dark" ? TakeoffIconDark : TakeoffIconLight}
            height={80}
            width={80}
            alt="Plane icon"
          />
        </div>
      </div>
    </div>
  );
});
