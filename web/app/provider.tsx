"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider, useTheme } from "next-themes";
import { SWRConfig } from "swr";
import { Toast } from "@plane/ui";
import { SWR_CONFIG } from "@/constants/swr-config";
import { resolveGeneralTheme } from "@/helpers/theme.helper";
import { AppProgressBar } from "@/lib/n-progress";
import { StoreProvider } from "@/lib/store-context";

const StoreWrapper = dynamic(() => import("@/lib/wrappers/store-wrapper"), { ssr: false });

export interface IAppProvider {
  children: ReactNode;
}
const ToastWithTheme = () => {
  const { resolvedTheme } = useTheme();

  return <Toast theme={resolveGeneralTheme(resolvedTheme)} />;
};
export const AppProvider = ({ children }: IAppProvider) => (
  <>
    <AppProgressBar height="4px" color="#3f76ff" options={{ showSpinner: false }} shallowRouting />
    <StoreProvider>
      <ThemeProvider themes={["light", "dark", "light-contrast", "dark-contrast", "custom"]} defaultTheme="system">
        <ToastWithTheme />

        <StoreWrapper>
          <SWRConfig value={SWR_CONFIG}>{children}</SWRConfig>
        </StoreWrapper>
      </ThemeProvider>
    </StoreProvider>
  </>
);
