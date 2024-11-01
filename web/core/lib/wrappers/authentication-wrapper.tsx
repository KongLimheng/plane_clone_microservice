"use client";

import { FC, ReactNode } from "react";
import { observer } from "mobx-react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { LogoSpinner } from "@/components/common";
import { EPageTypes } from "@/helpers/authentication.helper";
import { useUser, useUserProfile, useUserSettings, useWorkspace } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";

type TPageType = EPageTypes;

type TAuthenticationWrapper = {
  children: ReactNode;
  pageType?: TPageType;
};

const isValidURL = (url: string) => {
  const disallowedSchemes = /^(https?|ftp):\/\//i;
  return !disallowedSchemes.test(url);
};

export const AuthenticationWrapper: FC<TAuthenticationWrapper> = observer(
  ({ children, pageType = EPageTypes.AUTHENTICATED }) => {
    const pathname = usePathname();
    const router = useAppRouter();

    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next_path");

    const { isLoading: isUserLoading, data: currentUser, fetchCurrentUser } = useUser();
    const { data: currentUserProfile } = useUserProfile();

    console.log(currentUser);
    const { data: currentUserSettings } = useUserSettings();
    const { loader: workspacesLoader, workspaces } = useWorkspace();

    const { isLoading: isUserSWRLoading } = useSWR("USER_INFORMATION", async () => await fetchCurrentUser(), {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    });

    const isUserOnboard =
      currentUserProfile?.is_onboarded ||
      (currentUserProfile?.onboarding_step?.profile_complete &&
        currentUserProfile?.onboarding_step?.workspace_create &&
        currentUserProfile?.onboarding_step?.workspace_invite &&
        currentUserProfile?.onboarding_step?.workspace_join) ||
      false;

    const getWorkspaceRedirectionUrl = () => {
      let redirectionRoute = "/profile";
      if (nextPath && isValidURL(nextPath.toString())) {
        redirectionRoute = nextPath.toString();
        return redirectionRoute;
      }

      // validate the last and fallback workspace_slug
      const currentWorkspaceSlug =
        currentUserSettings.workspace.last_workspace_slug || currentUserSettings.workspace.fallback_workspace_slug;

      // validate the current workspace_slug is available in the user's workspace list
      const isCurrentWorkspaceValid = Object.values(workspaces || {}).findIndex(
        (workspace) => workspace.slug === currentWorkspaceSlug
      );

      if (isCurrentWorkspaceValid >= 0) redirectionRoute = `/${currentWorkspaceSlug}`;

      return redirectionRoute;
    };

    if ((isUserSWRLoading || isUserLoading || workspacesLoader) && !currentUser?.id)
      return (
        <div className="relative flex h-screen w-full items-center justify-center">
          <LogoSpinner />
        </div>
      );

    if (pageType === EPageTypes.PUBLIC) return <>{children}</>;

    if (pageType === EPageTypes.NON_AUTHENTICATED) {
      if (!currentUser?.id) return <>{children}</>;
      else {
        if (currentUserProfile.id && isUserOnboard) {
          const currentRedirectRoute = getWorkspaceRedirectionUrl();
          router.push(currentRedirectRoute);

          return;
        } else {
          router.push("/onboarding");
        }
      }
    }

    if (pageType === EPageTypes.ONBOARDING) {
      if (!currentUser?.id) {
        router.push(`/${pathname ? `?next_path=${pathname}` : ""}`);
        return;
      } else {
        if (currentUser && currentUserProfile.id && isUserOnboard) {
          const currentRedirectRoute = getWorkspaceRedirectionUrl();
          router.replace(currentRedirectRoute);

          return <></>;
        }
      }
    }

    if (pageType === EPageTypes.AUTHENTICATED) {
      if (currentUser?.id) {
        if (currentUserProfile && currentUserProfile?.id && isUserOnboard) return <>{children}</>;
        else {
          router.push(`/onboarding`);
          return <></>;
        }
      } else {
        router.push(`/${pathname ? `?next_path=${pathname}` : ``}`);
        return <></>;
      }
    }

    return <div>{children}</div>;
  }
);
