import React, { FC, ReactNode, useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { applyTheme, unsetCustomCssVariables } from "@/helpers/theme.helper";
import { useAppTheme, useRouterParams, useUserProfile } from "@/hooks/store";

type TStoreWrapper = {
  children: ReactNode;
};

const StoreWrapper: FC<TStoreWrapper> = observer(({ children }) => {
  const { setTheme } = useTheme();

  const params = useParams();

  const { setQuery } = useRouterParams();
  const { sidebarCollapsed, toggleSidebar } = useAppTheme();
  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    const localValue = localStorage && localStorage.getItem("app_sidebar_collapsed");
    const localBoolValue = localValue ? (localValue === "true" ? true : false) : false;
    if (localValue && sidebarCollapsed === undefined) toggleSidebar(localBoolValue);
  }, [sidebarCollapsed, setTheme, toggleSidebar]);

  useEffect(() => {
    if (!userProfile.theme.theme) return;
    const currentTheme = userProfile.theme.theme || "system";
    const currentThemePalette = userProfile?.theme?.palette;

    if (currentTheme) {
      setTheme(currentTheme);
      if (currentTheme === "custom" && currentThemePalette) {
        applyTheme(
          currentThemePalette !== ",,,," ? currentThemePalette : "#0d101b,#c5c5c5,#3f76ff,#0d101b,#c5c5c5",
          false
        );
      }
    } else unsetCustomCssVariables();
  }, [userProfile?.theme?.theme, userProfile?.theme?.palette, setTheme]);

  /**
   * Setting up the theme of the user by fetching it from local storage
   */
  useEffect(() => {
    if (!params) return;
    setQuery(params);
  }, [params, setQuery]);

  return <>{children}</>;
});

export default StoreWrapper;
