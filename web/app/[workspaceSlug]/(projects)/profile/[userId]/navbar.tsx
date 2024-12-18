import Link from "next/link";
import { usePathname } from "next/navigation";
import { EHeaderVariant, Header } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { useRouterParams } from "@/hooks/store";

type Props = {
  tabsList: {
    route: string;
    label: string;
    selected: string;
  }[];
};

export const ProfileNavbar = ({ tabsList }: Props) => {
  const { workspaceSlug, userId } = useRouterParams();
  const pathname = usePathname();

  return (
    <Header variant={EHeaderVariant.SECONDARY} showOnMobile={false}>
      <div className="flex items-center overflow-x-scroll">
        {tabsList.map((tab) => (
          <Link key={tab.route} href={`/${workspaceSlug}/profile/${userId}/${tab.route}`}>
            <span
              className={cn(
                "flex whitespace-nowrap border-b-2 p-4 text-sm font-medium outline-none",
                pathname === `/${workspaceSlug}/profile/${userId}${tab.selected}`
                  ? "border-custom-primary-100 text-custom-primary-100"
                  : "border-transparent"
              )}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </Header>
  );
};
