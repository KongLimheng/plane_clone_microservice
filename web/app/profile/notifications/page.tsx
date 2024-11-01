"use client";

import useSWR from "swr";
import { PageHead } from "@/components/core";
import { ProfileSettingContentWrapper } from "@/components/profile";
import { EmailSettingsLoader } from "@/components/ui";
import { UserService } from "@/services/user.service";

const userService = new UserService();
export default function ProfileNotificationPage() {
  // fetching user email notification settings
  const { data, isLoading, error } = useSWR("CURRENT_USER_EMAIL_NOTIFICATION_SETTINGS", () =>
    userService.currentUserEmailNotificationSettings()
  );

  if (!data || isLoading) {
    return <EmailSettingsLoader />;
  }

  return (
    <>
      <PageHead title="Profile - Notification" />
      <ProfileSettingContentWrapper>
        <div>profile</div>
      </ProfileSettingContentWrapper>
    </>
  );
}
