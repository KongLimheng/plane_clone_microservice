"use client";

import { observer } from "mobx-react";
import useSWR from "swr";
import { Card, Loader } from "@plane/ui";
import { ProfileEmptyState } from "@/components/ui";
import { USER_PROFILE_ACTIVITY } from "@/constants/fetch-key";
import { useRouterParams, useUser } from "@/hooks/store";
import recentActivityEmptyState from "@/public/empty-state/recent_activity.svg";
import { UserService } from "@/services/user.service";

const userService = new UserService();

export const ProfileActivity = observer(() => {
  const { workspaceSlug, userId } = useRouterParams();
  // store hooks
  const { data: currentUser } = useUser();

  const { data: userProfileActivity } = useSWR(
    workspaceSlug && userId ? USER_PROFILE_ACTIVITY(workspaceSlug, userId, {}) : null,
    workspaceSlug && userId
      ? () =>
          userService.getUserProfileActivity(workspaceSlug, userId, {
            per_page: 10,
          })
      : null
  );

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Recent activity</h3>
      <Card>
        {userProfileActivity ? (
          userProfileActivity.results.length > 0 ? (
            <div className="space-y-5">activity</div>
          ) : (
            <ProfileEmptyState
              title="No Data yet"
              description="We couldn’t find data. Kindly view your inputs"
              image={recentActivityEmptyState}
            />
          )
        ) : (
          <Loader className="space-y-5">
            <Loader.Item height="40px" />
            <Loader.Item height="40px" />
            <Loader.Item height="40px" />
            <Loader.Item height="40px" />
            <Loader.Item height="40px" />
          </Loader>
        )}
      </Card>
    </div>
  );
});
