"use client";

import { observer } from "mobx-react";
import { LucideIcon, User } from "lucide-react";
import { Avatar, AvatarGroup } from "@plane/ui";
import { getFileURL } from "@/helpers/file.helper";
import { useMember } from "@/hooks/store/use-member";

type AvatarProps = {
  showTooltip: boolean;
  userIds: string | string[] | null;
  icon?: LucideIcon;
};

export const ButtonAvatars = observer(({ showTooltip, userIds, icon: Icon }: AvatarProps) => {
  // store hooks
  const { getUserDetails } = useMember();

  if (Array.isArray(userIds)) {
    if (userIds.length > 0)
      return (
        <AvatarGroup size={"md"} showTooltip={!showTooltip}>
          {userIds.map((userId) => {
            const userDetails = getUserDetails(userId);
            if (!userDetails) return;
            return <Avatar key={userId} src={getFileURL(userDetails.avatar_url)} name={userDetails.display_name} />;
          })}
        </AvatarGroup>
      );
  } else {
    if (userIds) {
      const userDetails = getUserDetails(userIds);
      return (
        <Avatar
          src={getFileURL(userDetails?.avatar_url ?? "")}
          name={userDetails?.display_name}
          size={"md"}
          showTooltip={!showTooltip}
        />
      );
    }
  }

  return Icon ? <Icon className="size-3 flex-shrink-0" /> : <User className="size-3 mx-[4px] flex-shrink-0" />;
});
