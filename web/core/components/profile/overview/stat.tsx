"use client";

import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { IUserProfileData } from "@plane/types";
import { Card, CreateIcon, ECardDirection, ECardSpacing, LayerStackIcon, Loader } from "@plane/ui";
import { useRouterParams } from "@/hooks/store";

type Props = {
  userProfile: IUserProfileData | undefined;
};

export const ProfileStats = ({ userProfile }: Props) => {
  const { workspaceSlug, userId } = useRouterParams();

  const overviewCards = [
    {
      icon: CreateIcon,
      route: "created",
      title: "Issues created",
      value: userProfile?.created_issues ?? "...",
    },
    {
      icon: UserCircle2,
      route: "assigned",
      title: "Issues assigned",
      value: userProfile?.assigned_issues ?? "...",
    },
    {
      icon: LayerStackIcon,
      route: "subscribed",
      title: "Issues subscribed",
      value: userProfile?.subscribed_issues ?? "...",
    },
  ];
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Overview</h3>
      {userProfile ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map((card) => (
            <Link href={`/${workspaceSlug}/profile/${userId}/${card.route}`} key={card.route}>
              <Card className="h-full" direction={ECardDirection.ROW} spacing={ECardSpacing.SM}>
                <div className="grid size-11 place-items-center rounded bg-custom-background-90">
                  <card.icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-custom-text-400">{card.title}</p>
                  <p className="text-xl font-semibold">{card.value}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Loader className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Loader.Item height="80px" />
          <Loader.Item height="80px" />
          <Loader.Item height="80px" />
        </Loader>
      )}
    </div>
  );
};
