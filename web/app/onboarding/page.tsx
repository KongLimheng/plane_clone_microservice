"use client";

import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { TOnboardingSteps, TUserProfile } from "@plane/types";
import { setToast, TOAST_TYPE } from "@plane/ui";
import { LogoSpinner } from "@/components/common";
import { ProfileSetup } from "@/components/onboarding";
import { CreateOrJoinWorkspaces } from "@/components/onboarding/create-or-join-workspace";
import { USER_WORKSPACES_LIST } from "@/constants/fetch-keys";
import { EPageTypes } from "@/helpers/authentication.helper";
import { useUser, useUserProfile, useWorkspace } from "@/hooks/store";
import { AuthenticationWrapper } from "@/lib/wrappers";
import { WorkspaceService } from "@/plane-web/services";

enum EOnboardingSteps {
  PROFILE_SETUP = "PROFILE_SETUP",
  WORKSPACE_CREATE_OR_JOIN = "WORKSPACE_CREATE_OR_JOIN",
  INVITE_MEMBERS = "INVITE_MEMBERS",
}

const workspaceService = new WorkspaceService();

const OnboardingPage = observer(() => {
  const [step, setStep] = useState<EOnboardingSteps | null>(null);
  const [totalSteps, setTotalSteps] = useState<number | null>(null);

  const { isLoading: userLoader, data: user, updateCurrentUser } = useUser();

  const { data: profile, updateUserProfile, finishUserOnboarding } = useUserProfile();
  const { workspaces, fetchWorkspaces } = useWorkspace();

  // computed values
  const workspacesList = Object.values(workspaces ?? {});

  const { isLoading: workspaceListLoader } = useSWR(USER_WORKSPACES_LIST, () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    user?.id && fetchWorkspaces();
  });

  // fetching user workspace innvitations
  const { isLoading: invitationsLoader, data: invitations } = useSWR(
    `USER_WORKSPACE_INVITATIONS_LIST_${user?.id}`,
    () => {
      if (user?.id) return workspaceService.userWorkspaceInvitations();
    }
  );

  const stepChange = async (steps: Partial<TOnboardingSteps>) => {
    if (!user) return;

    const payload: Partial<TUserProfile> = {
      onboarding_step: {
        ...profile.onboarding_step,
        ...steps,
      },
    };

    await updateUserProfile(payload);
  };

  const finishOnboarding = useCallback(async () => {
    if (!user) return;
    finishUserOnboarding()
      .then(() => {})
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Failed",
          message: "Failed to finish onboarding, Please try again later.",
        });
      });
  }, [finishUserOnboarding, user]);

  useEffect(() => {
    // Never update the total steps if it's already set.
    if (!totalSteps && userLoader === false && workspaceListLoader === false) {
      // If user is already invited to a workspace, only show profile setup steps.
      if (workspacesList && workspacesList.length > 0) {
        // If password is auto set then show two different steps for profile setup, else merge them.

        if (user?.is_password_autoset) setTotalSteps(2);
        else setTotalSteps(1);
      } else {
        // If password is auto set then total steps will increase to 4 due to extra step at profile setup stage.

        if (user?.is_password_autoset) setTotalSteps(4);
        else setTotalSteps(3);
      }
    }
  }, [userLoader, workspaceListLoader, totalSteps, user?.is_password_autoset, workspacesList]);

  useEffect(() => {
    if (userLoader === false && profile && workspaceListLoader === false) {
      const onboardingStep = profile.onboarding_step;

      if (onboardingStep.profile_complete && !onboardingStep.workspace_create && workspacesList.length > 0) {
        finishOnboarding();
      }
    }
  }, [userLoader, profile, workspaceListLoader, finishOnboarding, workspacesList.length]);

  useEffect(() => {
    const handelStepChange = async () => {
      if (!user) return;
      const onboardingStep = profile.onboarding_step;
      if (!onboardingStep.profile_complete) setStep(EOnboardingSteps.PROFILE_SETUP);

      if (
        onboardingStep.profile_complete &&
        !(onboardingStep.workspace_join || onboardingStep.workspace_create || workspacesList.length > 0)
      ) {
        setStep(EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN);
      }

      if (
        onboardingStep.profile_complete &&
        (onboardingStep.workspace_join || onboardingStep.workspace_create) &&
        !onboardingStep.workspace_invite
      ) {
        setStep(EOnboardingSteps.INVITE_MEMBERS);
      }
    };

    handelStepChange();
  }, [user, step, profile.onboarding_step, workspacesList, updateCurrentUser]);

  return (
    <AuthenticationWrapper pageType={EPageTypes.ONBOARDING}>
      {user && totalSteps && step !== null && !invitationsLoader ? (
        <div>
          {step === EOnboardingSteps.PROFILE_SETUP ? (
            <ProfileSetup
              user={user}
              totalSteps={totalSteps}
              stepChange={stepChange}
              finishOnboarding={finishOnboarding}
            />
          ) : step === EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN ? (
            <CreateOrJoinWorkspaces
              totalSteps={totalSteps}
              stepChange={stepChange}
              finishOnboarding={finishOnboarding}
              invitations={invitations ?? []}
            />
          ) : step === EOnboardingSteps.INVITE_MEMBERS ? (
            <div>Invite</div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              Something Went wrong. Please try again.
            </div>
          )}
        </div>
      ) : (
        <div className="grid h-screen w-full place-items-center">
          <LogoSpinner />
        </div>
      )}
    </AuthenticationWrapper>
  );
});

export default OnboardingPage;
