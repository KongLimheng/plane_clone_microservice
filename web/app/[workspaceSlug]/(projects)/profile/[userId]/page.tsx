"use client";

import React from "react";
import useSWR from "swr";
import { IUserStateDistribution, TStateGroups } from "@plane/types";
import { ContentWrapper } from "@plane/ui";
import { PageHead } from "@/components/core";
import {
  ProfileActivity,
  ProfilePriorityDistribution,
  ProfileStateDistribution,
  ProfileStats,
  ProfileWorkload,
} from "@/components/profile";
import { USER_PROFILE_DATA } from "@/constants/fetch-key";
import { GROUP_CHOICES } from "@/constants/project";
import { useRouterParams, useUser, useUserProfile } from "@/hooks/store";
import { UserService } from "@/services/user.service";

// services
const userService = new UserService();
const ProfileOverviewPage = () => {
  const { workspaceSlug, userId } = useRouterParams();

  const { data: userProfile } = useSWR(
    workspaceSlug && userId ? USER_PROFILE_DATA(workspaceSlug.toString(), userId) : null,
    workspaceSlug && userId ? () => userService.getUserProfileData(workspaceSlug, userId) : null
  );

  const stateDistribution: IUserStateDistribution[] = Object.keys(GROUP_CHOICES).map((key) => {
    const group = userProfile?.state_distribution.find((g) => g.state_group === key);
    if (group) return group;
    return { state_group: key as TStateGroups, state_count: 0 };
  });

  return (
    <>
      <PageHead title="Your work" />
      <ContentWrapper className="space-y-7">
        <ProfileStats userProfile={userProfile} />
        <ProfileWorkload stateDistribution={stateDistribution} />

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
          <ProfilePriorityDistribution userProfile={userProfile} />
          <ProfileStateDistribution stateDistribution={stateDistribution} userProfile={userProfile} />
        </div>

        <ProfileActivity />
      </ContentWrapper>
    </>
  );
};

export default ProfileOverviewPage;
