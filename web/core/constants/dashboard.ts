import { BarChart2, Briefcase, Home, Inbox, Layers, PenSquare } from "lucide-react";
import { ContrastIcon, UserActivityIcon } from "@plane/ui";
import { Props } from "@/components/icons/types";
import { EUserPermissions } from "@/plane-web/constants/user-permissions";

export const SIDEBAR_WORKSPACE_MENU_ITEMS: {
  key: string;
  label: string;
  href: string;
  access: EUserPermissions[];
  highlight: (pathname: string, baseUrl: string) => boolean;
  Icon: React.FC<Props>;
}[] = [
  {
    key: "projects",
    label: "Projects",
    href: `/projects`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/projects/`,
    Icon: Briefcase,
  },
  {
    key: "all-issues",
    label: "Views",
    href: `/workspace-views/all-issues`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname.includes(`${baseUrl}/workspace-views/`),
    Icon: Layers,
  },
  {
    key: "active-cycles",
    label: "Cycles",
    href: `/active-cycles`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/active-cycles/`,
    Icon: ContrastIcon,
  },
  {
    key: "analytics",
    label: "Analytics",
    href: `/analytics`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname.includes(`${baseUrl}/analytics/`),
    Icon: BarChart2,
  },
];

type TLinkOptions = {
  userId: string | undefined;
};
export const SIDEBAR_USER_MENU_ITEMS: {
  key: string;
  label: string;
  href: string;
  access: EUserPermissions[];
  highlight: (pathname: string, baseUrl: string, options?: TLinkOptions) => boolean;
  Icon: React.FC<Props>;
}[] = [
  {
    key: "home",
    label: "Home",
    href: ``,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/`,
    Icon: Home,
  },
  {
    key: "your-work",
    label: "Your work",
    href: "/profile",
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string, options?: TLinkOptions) =>
      options?.userId ? pathname.includes(`${baseUrl}/profile/${options?.userId}`) : false,
    Icon: UserActivityIcon,
  },
  {
    key: "notifications",
    label: "Inbox",
    href: `/notifications`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname.includes(`${baseUrl}/notifications/`),
    Icon: Inbox,
  },
  {
    key: "drafts",
    label: "Drafts",
    href: `/drafts`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname.includes(`${baseUrl}/drafts/`),
    Icon: PenSquare,
  },
];
