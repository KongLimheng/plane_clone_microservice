import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { IWorkspaceMemberInvitation, TOnboardingSteps } from "@plane/types";
// assets
import { useUser } from "@/hooks/store";
import CreateJoinWorkspaceDark from "@/public/onboarding/create-join-workspace-dark.webp";
import CreateJoinWorkspace from "@/public/onboarding/create-join-workspace-light.webp";
import { LogoSpinner } from "../common";
import { CreateWorkspace } from "./create-workspace";
import { OnboardingHeader } from "./header";
import { SwitchAccountDropDown } from "./switch-account-dropdown";

export enum ECreateOrJoinWorkspaceViews {
  WORKSPACE_CREATE = "WORKSPACE_CREATE",
  WORKSPACE_JOIN = "WORKSPACE_JOIN",
}

type Props = {
  invitations: IWorkspaceMemberInvitation[];
  totalSteps: number;
  stepChange: (steps: Partial<TOnboardingSteps>) => Promise<void>;
  finishOnboarding: () => Promise<void>;
};

export const CreateOrJoinWorkspaces = observer(({ invitations, totalSteps, stepChange, finishOnboarding }: Props) => {
  // states
  const [currentView, setCurrentView] = useState<ECreateOrJoinWorkspaceViews | null>(null);
  // store hooks
  const { data: user } = useUser();
  // hooks
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (invitations.length > 0) setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN);
    setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_CREATE);
  }, [invitations]);

  const handleNextStep = async () => {
    if (!user) return;

    await finishOnboarding();
  };
  return (
    <div className="flex h-full w-full">
      <div className="w-full h-full overflow-auto px-6 py-10 sm:px-7 sm:py-14 md:px-14 lg:px-28">
        <div className="flex items-center justify-between">
          <OnboardingHeader currentStep={totalSteps - 1} totalSteps={totalSteps} />
          <div className="shrink-0 lg:hidden">
            <SwitchAccountDropDown />
          </div>
        </div>
        <div>
          {currentView === ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN ? (
            <div>hi</div>
          ) : currentView === ECreateOrJoinWorkspaceViews.WORKSPACE_CREATE ? (
            <CreateWorkspace
              user={user}
              invitedWorkspaces={invitations.length}
              handleCurrentViewChange={() => setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN)}
              stepChange={stepChange}
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center">
              <LogoSpinner />
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block relative w-2/5 h-screen overflow-hidden px-6 py-10 sm:px-7 sm:py-14 md:px-14 lg:px-28">
        <SwitchAccountDropDown />
        <div className="absolute inset-0 z-0">
          <Image
            src={resolvedTheme === "dark" ? CreateJoinWorkspaceDark : CreateJoinWorkspace}
            className="h-screen w-auto float-end object-cover"
            alt="Profile setup"
          />
        </div>
      </div>
    </div>
  );
});
